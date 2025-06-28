package com.requesttheai.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "usages")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "real_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal realAmount;

    @NotNull
    @Column(name = "platform_revenue", nullable = false, precision = 19, scale = 2)
    private BigDecimal platformRevenue;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime timestamp;

    @NotNull
    @Column(name = "tokens", nullable = false)
    private Integer tokens;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;
}