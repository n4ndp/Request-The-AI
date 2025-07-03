package com.requesttheai.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.requesttheai.backend.model.enums.TransactionStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usages",
    indexes = {
        @Index(name = "idx_usages_status", columnList = "status"),
        @Index(name = "idx_usages_created_at", columnList = "created_at"),
        @Index(name = "idx_usages_total_amount", columnList = "total_amount")
    })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "real_amount", nullable = false, precision = 19, scale = 8)
    private BigDecimal realAmount;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "platform_revenue", nullable = false, precision = 19, scale = 8)
    private BigDecimal platformRevenue;

    @NotNull
    @DecimalMin("0.00")
    @Column(name="total_amount", nullable = false, precision = 19, scale = 8)
    private BigDecimal totalAmount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Integer tokens;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.PENDING;
}