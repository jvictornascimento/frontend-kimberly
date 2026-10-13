package br.com.belyeve.backend.orders;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class OrderEntity {
    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private Integer installments;

    private String asaasCustomerId;
    private String asaasPaymentId;

    @Column(columnDefinition = "TEXT")
    private String pixPayload;

    @Column(columnDefinition = "TEXT")
    private String pixQrCodeBase64;

    private Instant pixExpirationAt;
    private int scoopQuantity;

    @Enumerated(EnumType.STRING)
    private JewelryCategory jewelryCategory;

    private boolean usesRings;
    private String ringSize;
    private boolean allowsMalePieces;

    @Enumerated(EnumType.STRING)
    private JewelryCategory maleJewelryCategory;

    private boolean allowsPiercing;
    private String piercingLocations;
    private String restrictions;
    private boolean socialMediaConsent;
    private String fullName;
    private String whatsapp;
    private String email;
    private String cpf;
    private String zipCode;
    private String street;
    private String addressNumber;
    private String complement;
    private String district;
    private String city;
    private String state;
    private long unitPriceCents;
    private long subtotalCents;
    private long discountCents;
    private long shippingCents;
    private UUID shippingQuoteId;
    @Column(length = 20) private String shippingKind;
    @Column(length = 120) private String shippingCarrier;
    @Column(length = 120) private String shippingService;
    @Column(length = 20) private String shippingEnvironment;
    private Integer shippingProviderServiceId;
    private Integer shippingMinDays;
    private Integer shippingMaxDays;
    private long totalCents;
    private Instant createdAt;
    private Instant updatedAt;

    protected OrderEntity() {
    }

    public OrderEntity(UUID id) {
        this.id = id;
        this.status = OrderStatus.DRAFT;
        this.paymentStatus = PaymentStatus.NOT_CREATED;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public Integer getInstallments() {
        return installments;
    }

    public void setInstallments(Integer installments) {
        this.installments = installments;
    }

    public String getAsaasCustomerId() {
        return asaasCustomerId;
    }

    public void setAsaasCustomerId(String asaasCustomerId) {
        this.asaasCustomerId = asaasCustomerId;
    }

    public String getAsaasPaymentId() {
        return asaasPaymentId;
    }

    public void setAsaasPaymentId(String asaasPaymentId) {
        this.asaasPaymentId = asaasPaymentId;
    }

    public String getPixPayload() {
        return pixPayload;
    }

    public void setPixPayload(String pixPayload) {
        this.pixPayload = pixPayload;
    }

    public String getPixQrCodeBase64() {
        return pixQrCodeBase64;
    }

    public void setPixQrCodeBase64(String pixQrCodeBase64) {
        this.pixQrCodeBase64 = pixQrCodeBase64;
    }

    public Instant getPixExpirationAt() {
        return pixExpirationAt;
    }

    public void setPixExpirationAt(Instant pixExpirationAt) {
        this.pixExpirationAt = pixExpirationAt;
    }

    public int getScoopQuantity() {
        return scoopQuantity;
    }

    public void setScoopQuantity(int scoopQuantity) {
        this.scoopQuantity = scoopQuantity;
    }

    public JewelryCategory getJewelryCategory() {
        return jewelryCategory;
    }

    public void setJewelryCategory(JewelryCategory jewelryCategory) {
        this.jewelryCategory = jewelryCategory;
    }

    public boolean isUsesRings() {
        return usesRings;
    }

    public void setUsesRings(boolean usesRings) {
        this.usesRings = usesRings;
    }

    public String getRingSize() {
        return ringSize;
    }

    public void setRingSize(String ringSize) {
        this.ringSize = ringSize;
    }

    public boolean isAllowsMalePieces() {
        return allowsMalePieces;
    }

    public void setAllowsMalePieces(boolean allowsMalePieces) {
        this.allowsMalePieces = allowsMalePieces;
    }

    public JewelryCategory getMaleJewelryCategory() {
        return maleJewelryCategory;
    }

    public void setMaleJewelryCategory(JewelryCategory maleJewelryCategory) {
        this.maleJewelryCategory = maleJewelryCategory;
    }

    public boolean isAllowsPiercing() {
        return allowsPiercing;
    }

    public void setAllowsPiercing(boolean allowsPiercing) {
        this.allowsPiercing = allowsPiercing;
    }

    public String getPiercingLocations() {
        return piercingLocations;
    }

    public void setPiercingLocations(String piercingLocations) {
        this.piercingLocations = piercingLocations;
    }

    public String getRestrictions() {
        return restrictions;
    }

    public void setRestrictions(String restrictions) {
        this.restrictions = restrictions;
    }

    public boolean isSocialMediaConsent() {
        return socialMediaConsent;
    }

    public void setSocialMediaConsent(boolean socialMediaConsent) {
        this.socialMediaConsent = socialMediaConsent;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public void setWhatsapp(String whatsapp) {
        this.whatsapp = whatsapp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getAddressNumber() {
        return addressNumber;
    }

    public void setAddressNumber(String addressNumber) {
        this.addressNumber = addressNumber;
    }

    public String getComplement() {
        return complement;
    }

    public void setComplement(String complement) {
        this.complement = complement;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public long getUnitPriceCents() {
        return unitPriceCents;
    }

    public void setUnitPriceCents(long unitPriceCents) {
        this.unitPriceCents = unitPriceCents;
    }

    public long getSubtotalCents() {
        return subtotalCents;
    }

    public void setSubtotalCents(long subtotalCents) {
        this.subtotalCents = subtotalCents;
    }

    public long getDiscountCents() {
        return discountCents;
    }

    public void setDiscountCents(long discountCents) {
        this.discountCents = discountCents;
    }

    public long getShippingCents() {
        return shippingCents;
    }

    public void setShippingCents(long shippingCents) {
        this.shippingCents = shippingCents;
    }

    public long getTotalCents() {
        return totalCents;
    }

    public void setTotalCents(long totalCents) {
        this.totalCents = totalCents;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public UUID getShippingQuoteId() { return shippingQuoteId; }
    public void setShippingQuoteId(UUID value) { shippingQuoteId = value; }
    public String getShippingKind() { return shippingKind; }
    public void setShippingKind(String value) { shippingKind = value; }
    public String getShippingCarrier() { return shippingCarrier; }
    public void setShippingCarrier(String value) { shippingCarrier = value; }
    public String getShippingService() { return shippingService; }
    public void setShippingService(String value) { shippingService = value; }
    public String getShippingEnvironment() { return shippingEnvironment; }
    public void setShippingEnvironment(String value) { shippingEnvironment = value; }
    public Integer getShippingProviderServiceId() { return shippingProviderServiceId; }
    public void setShippingProviderServiceId(Integer value) { shippingProviderServiceId = value; }
    public Integer getShippingMinDays() { return shippingMinDays; }
    public void setShippingMinDays(Integer value) { shippingMinDays = value; }
    public Integer getShippingMaxDays() { return shippingMaxDays; }
    public void setShippingMaxDays(Integer value) { shippingMaxDays = value; }
}
