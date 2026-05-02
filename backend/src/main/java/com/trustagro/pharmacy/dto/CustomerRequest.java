package com.trustagro.pharmacy.dto;

import com.trustagro.pharmacy.entity.CustomerType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank private String customerName;
    private String phone;
    private String location;
    private CustomerType customerType;
}
