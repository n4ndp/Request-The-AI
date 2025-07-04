package com.requesttheai.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "models", 
       uniqueConstraints = @UniqueConstraint(name = "uk_model_name", columnNames = "name"),
    indexes = {
        @Index(name = "idx_models_provider", columnList = "provider"),
        @Index(name = "idx_models_name", columnList = "name")
    })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Model {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @DecimalMin("0.00")
    @Column(name = "profit_margin", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal profitMargin = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "price_input", nullable = false, precision = 19, scale = 8)
    @NotNull
    private BigDecimal priceInput;

    @DecimalMin("0.00")
    @Column(name = "price_output", nullable = false, precision = 19, scale = 8)
    @NotNull
    private BigDecimal priceOutput;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false)
    private String provider;

    @Size(max = 255)
    @Column
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}