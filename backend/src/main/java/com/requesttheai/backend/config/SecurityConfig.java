package com.requesttheai.backend.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(authRequest -> authRequest
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/ai/**").permitAll()
                // Users
                .requestMatchers(HttpMethod.GET, "/api/users").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/users/*").hasAuthority("ADMIN")
                .requestMatchers("/api/users/delete/*").hasAuthority("ADMIN")
                .requestMatchers("/api/users/me").hasAnyAuthority("USER", "ADMIN")
                // Recharge
                .requestMatchers("/api/recharge/*").hasAnyAuthority("USER", "ADMIN")
                // Models
                .requestMatchers(HttpMethod.GET, "/api/models").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/models?fullInfo=true").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/models").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/models/*").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/models/*").hasAuthority("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authProvider)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedOrigins(Arrays.asList("*")); // solo para probar, luego lo quito
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "X-Custom-Header"
        ));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}