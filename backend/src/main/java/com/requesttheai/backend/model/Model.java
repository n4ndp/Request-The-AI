package com.requesttheai.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "models")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Model {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "profit_margin", nullable = false, precision = 5, scale = 2)
    private BigDecimal profitMargin;

    @NotNull
    @Column(name = "price_input", nullable = false, precision = 7, scale = 2)
    private BigDecimal priceInput;

    @NotNull
    @Column(name = "price_output", nullable = false, precision = 7, scale = 2)
    private BigDecimal priceOutput;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String provider;

    @Column(length = 255)
    private String description;
}