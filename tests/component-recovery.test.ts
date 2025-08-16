import { describe, it, expect, beforeEach } from "vitest"

describe("Component Recovery Contract", () => {
  let contractState
  
  beforeEach(() => {
    contractState = {
      nextComponentId: 1,
      nextFacilityId: 1,
      nextTestId: 1,
      recoveredComponents: new Map(),
      recoveryFacilities: new Map(),
      refurbishmentRecords: new Map(),
      qualityTests: new Map(),
      secondaryMarketSales: new Map(),
      materialRecovery: new Map(),
    }
  })
  
  describe("Recovery Facility Management", () => {
    it("should register recovery facility successfully", () => {
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [1, 2, 3], // Processor, Memory, Storage
        contactInfo: "contact@greentech.com",
      }
      
      const result = registerRecoveryFacility(contractState, facilityData)
      
      expect(result.success).toBe(true)
      expect(result.facilityId).toBe(1)
      expect(contractState.recoveryFacilities.has(1)).toBe(true)
      
      const facility = contractState.recoveryFacilities.get(1)
      expect(facility.name).toBe("GreenTech Recovery")
      expect(facility.isActive).toBe(false) // Not certified yet
    })
    
    it("should certify facility successfully", () => {
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [1, 2, 3],
        contactInfo: "contact@greentech.com",
      }
      
      registerRecoveryFacility(contractState, facilityData)
      const result = certifyFacility(contractState, 1)
      
      expect(result.success).toBe(true)
      
      const facility = contractState.recoveryFacilities.get(1)
      expect(facility.isActive).toBe(true)
      expect(facility.certificationDate).toBeGreaterThan(0)
    })
    
    it("should reject facility with invalid certification level", () => {
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 10, // Invalid level
        specializations: [1, 2, 3],
        contactInfo: "contact@greentech.com",
      }
      
      const result = registerRecoveryFacility(contractState, facilityData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR-INVALID-INPUT")
    })
  })
  
  describe("Component Extraction", () => {
    beforeEach(() => {
      // Register and certify a facility
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [1, 2, 3],
        contactInfo: "contact@greentech.com",
      }
      registerRecoveryFacility(contractState, facilityData)
      certifyFacility(contractState, 1)
    })
    
    it("should extract component successfully", () => {
      const componentData = {
        sourceDeviceId: 1,
        componentType: 1, // TYPE-PROCESSOR
        componentName: "Intel Core i7-12700K",
        manufacturer: "Intel Corporation",
        modelNumber: "i7-12700K",
        serialNumber: "CPU123456789",
        extractionFacility: 1,
        specifications: "12 cores, 20 threads, 3.6GHz base clock",
        conditionNotes: "Good condition, minor thermal paste residue",
      }
      
      const result = extractComponent(contractState, componentData)
      
      expect(result.success).toBe(true)
      expect(result.componentId).toBe(1)
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.componentName).toBe("Intel Core i7-12700K")
      expect(component.currentStatus).toBe(1) // STATUS-EXTRACTED
    })
    
    it("should reject extraction from uncertified facility", () => {
      // Register but don't certify facility
      const facilityData = {
        name: "Uncertified Facility",
        location: "Test Location",
        certificationLevel: 1,
        specializations: [1],
        contactInfo: "test@test.com",
      }
      registerRecoveryFacility(contractState, facilityData)
      
      const componentData = {
        sourceDeviceId: 1,
        componentType: 1,
        componentName: "Test Component",
        manufacturer: "Test Manufacturer",
        modelNumber: "TEST-001",
        serialNumber: null,
        extractionFacility: 2, // Uncertified facility
        specifications: "Test specs",
        conditionNotes: "Test condition",
      }
      
      const result = extractComponent(contractState, componentData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR-FACILITY-NOT-CERTIFIED")
    })
    
    it("should reject invalid component type", () => {
      const componentData = {
        sourceDeviceId: 1,
        componentType: 99, // Invalid type
        componentName: "Test Component",
        manufacturer: "Test Manufacturer",
        modelNumber: "TEST-001",
        serialNumber: null,
        extractionFacility: 1,
        specifications: "Test specs",
        conditionNotes: "Test condition",
      }
      
      const result = extractComponent(contractState, componentData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR-INVALID-INPUT")
    })
  })
  
  describe("Quality Assessment", () => {
    beforeEach(() => {
      // Setup facility and extract component
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [1, 2, 3],
        contactInfo: "contact@greentech.com",
      }
      registerRecoveryFacility(contractState, facilityData)
      certifyFacility(contractState, 1)
      
      const componentData = {
        sourceDeviceId: 1,
        componentType: 1,
        componentName: "Intel Core i7-12700K",
        manufacturer: "Intel Corporation",
        modelNumber: "i7-12700K",
        serialNumber: "CPU123456789",
        extractionFacility: 1,
        specifications: "12 cores, 20 threads, 3.6GHz base clock",
        conditionNotes: "Good condition",
      }
      extractComponent(contractState, componentData)
    })
    
    it("should conduct quality test successfully", () => {
      const testData = {
        componentId: 1,
        testType: "Performance Benchmark",
        testFacility: 1,
        testParameters: "CPU stress test, thermal monitoring, clock stability",
        testResults: "All cores stable at base clock, temperatures within spec",
        passFail: true,
        certificationStandard: "ISO-9001",
      }
      
      const result = conductQualityTest(contractState, testData)
      
      expect(result.success).toBe(true)
      expect(result.testId).toBe(1)
      
      const test = contractState.qualityTests.get(1)
      expect(test.testType).toBe("Performance Benchmark")
      expect(test.passFail).toBe(true)
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.currentStatus).toBe(2) // STATUS-TESTING
    })
    
    it("should assign quality grade successfully", () => {
      const result = assignQualityGrade(contractState, {
        componentId: 1,
        qualityGrade: 1, // GRADE-A
        estimatedValue: 25000, // $250.00 in cents
      })
      
      expect(result.success).toBe(true)
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.qualityGrade).toBe(1)
      expect(component.estimatedValue).toBe(25000)
      expect(component.currentStatus).toBe(4) // STATUS-CERTIFIED
    })
    
    it("should reject invalid quality grade", () => {
      const result = assignQualityGrade(contractState, {
        componentId: 1,
        qualityGrade: 99, // Invalid grade
        estimatedValue: 25000,
      })
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR-INVALID-GRADE")
    })
  })
  
  describe("Refurbishment Process", () => {
    beforeEach(() => {
      // Setup facility, extract component, and assign grade
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [1, 2, 3],
        contactInfo: "contact@greentech.com",
      }
      registerRecoveryFacility(contractState, facilityData)
      certifyFacility(contractState, 1)
      
      const componentData = {
        sourceDeviceId: 1,
        componentType: 1,
        componentName: "Intel Core i7-12700K",
        manufacturer: "Intel Corporation",
        modelNumber: "i7-12700K",
        serialNumber: "CPU123456789",
        extractionFacility: 1,
        specifications: "12 cores, 20 threads, 3.6GHz base clock",
        conditionNotes: "Needs cleaning and thermal paste replacement",
      }
      extractComponent(contractState, componentData)
      
      assignQualityGrade(contractState, {
        componentId: 1,
        qualityGrade: 2, // GRADE-B (needs minor refurbishment)
        estimatedValue: 20000,
      })
    })
    
    it("should start refurbishment successfully", () => {
      const result = startRefurbishment(contractState, {
        componentId: 1,
        refurbishmentFacility: 1,
        processesPlanned: "Clean component, replace thermal paste, test functionality",
      })
      
      expect(result.success).toBe(true)
      
      const refurbishment = contractState.refurbishmentRecords.get(1)
      expect(refurbishment.refurbishmentFacility).toBe(1)
      expect(refurbishment.completionDate).toBeNull()
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.currentStatus).toBe(3) // STATUS-REFURBISHING
    })
    
    it("should complete refurbishment successfully", () => {
      startRefurbishment(contractState, {
        componentId: 1,
        refurbishmentFacility: 1,
        processesPlanned: "Clean and test",
      })
      
      const result = completeRefurbishment(contractState, {
        componentId: 1,
        partsReplaced: "Thermal paste",
        laborHours: 2,
        refurbishmentCost: 1500, // $15.00 in cents
        finalGrade: 1, // GRADE-A after refurbishment
        notes: "Component fully restored to excellent condition",
      })
      
      expect(result.success).toBe(true)
      
      const refurbishment = contractState.refurbishmentRecords.get(1)
      expect(refurbishment.completionDate).toBeDefined()
      expect(refurbishment.finalGrade).toBe(1)
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.currentStatus).toBe(5) // STATUS-AVAILABLE
      expect(component.qualityGrade).toBe(1)
    })
  })
  
  describe("Secondary Market Sales", () => {
    beforeEach(() => {
      // Setup complete component ready for sale
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [1, 2, 3],
        contactInfo: "contact@greentech.com",
      }
      registerRecoveryFacility(contractState, facilityData)
      certifyFacility(contractState, 1)
      
      const componentData = {
        sourceDeviceId: 1,
        componentType: 1,
        componentName: "Intel Core i7-12700K",
        manufacturer: "Intel Corporation",
        modelNumber: "i7-12700K",
        serialNumber: "CPU123456789",
        extractionFacility: 1,
        specifications: "12 cores, 20 threads, 3.6GHz base clock",
        conditionNotes: "Excellent condition",
      }
      extractComponent(contractState, componentData)
      
      assignQualityGrade(contractState, {
        componentId: 1,
        qualityGrade: 1, // GRADE-A
        estimatedValue: 25000,
      })
      
      // Make component available for sale
      const component = contractState.recoveredComponents.get(1)
      component.currentStatus = 5 // STATUS-AVAILABLE
    })
    
    it("should sell component successfully", () => {
      const saleData = {
        componentId: 1,
        buyer: "buyer-principal",
        salePrice: 22000, // $220.00 in cents
        warrantyPeriod: 90, // 90 days
        salePlatform: "RefurbishedTech Marketplace",
      }
      
      const result = sellComponent(contractState, saleData)
      
      expect(result.success).toBe(true)
      
      const sale = contractState.secondaryMarketSales.get(1)
      expect(sale.buyer).toBe("buyer-principal")
      expect(sale.salePrice).toBe(22000)
      expect(sale.warrantyPeriod).toBe(90)
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.currentStatus).toBe(6) // STATUS-SOLD
    })
    
    it("should reject sale of unavailable component", () => {
      // Change component status to not available
      const component = contractState.recoveredComponents.get(1)
      component.currentStatus = 3 // STATUS-REFURBISHING
      
      const saleData = {
        componentId: 1,
        buyer: "buyer-principal",
        salePrice: 22000,
        warrantyPeriod: 90,
        salePlatform: "RefurbishedTech Marketplace",
      }
      
      const result = sellComponent(contractState, saleData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR-INVALID-STATUS")
    })
  })
  
  describe("Material Recovery", () => {
    beforeEach(() => {
      // Setup facility and component for material recovery
      const facilityData = {
        name: "GreenTech Recovery",
        location: "123 Recycling Ave, Green City",
        certificationLevel: 3,
        specializations: [7, 8], // Rare earth metals, precious metals
        contactInfo: "contact@greentech.com",
      }
      registerRecoveryFacility(contractState, facilityData)
      certifyFacility(contractState, 1)
      
      const componentData = {
        sourceDeviceId: 1,
        componentType: 6, // TYPE-CIRCUIT-BOARD
        componentName: "Motherboard",
        manufacturer: "ASUS",
        modelNumber: "ROG-Z690",
        serialNumber: null,
        extractionFacility: 1,
        specifications: "ATX motherboard with gold-plated connectors",
        conditionNotes: "Damaged, suitable for material recovery only",
      }
      extractComponent(contractState, componentData)
      
      assignQualityGrade(contractState, {
        componentId: 1,
        qualityGrade: 5, // GRADE-F (material recovery only)
        estimatedValue: 500, // $5.00 in cents for materials
      })
    })
    
    it("should process for material recovery successfully", () => {
      const recoveryData = {
        componentId: 1,
        recoveryMethod: "Chemical extraction and smelting",
        materialsRecovered: "Gold: 2.5g, Silver: 15g, Copper: 250g, Rare earth elements: 5g",
        recoveryYield: 85, // 85% recovery rate
        recoveryFacility: 1,
        environmentalImpact: "Reduced mining demand, proper waste disposal",
      }
      
      const result = processForMaterialRecovery(contractState, recoveryData)
      
      expect(result.success).toBe(true)
      
      const recovery = contractState.materialRecovery.get(1)
      expect(recovery.recoveryMethod).toBe("Chemical extraction and smelting")
      expect(recovery.recoveryYield).toBe(85)
      
      const component = contractState.recoveredComponents.get(1)
      expect(component.currentStatus).toBe(7) // STATUS-RECYCLED
    })
  })
})

// Mock implementation functions
function registerRecoveryFacility(state, data) {
  if (!data.name || data.name.length === 0) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  if (!data.location || data.location.length === 0) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  if (data.certificationLevel < 1 || data.certificationLevel > 5) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  const facilityId = state.nextFacilityId++
  const facility = {
    ...data,
    certifiedBy: "test-principal",
    certificationDate: 0,
    isActive: false,
  }
  
  state.recoveryFacilities.set(facilityId, facility)
  
  return { success: true, facilityId }
}

function certifyFacility(state, facilityId) {
  const facility = state.recoveryFacilities.get(facilityId)
  if (!facility) {
    return { success: false, error: "ERR-DEVICE-NOT-FOUND" }
  }
  
  facility.certifiedBy = "contract-owner"
  facility.certificationDate = Date.now()
  facility.isActive = true
  
  return { success: true }
}

function extractComponent(state, data) {
  if (data.sourceDeviceId <= 0) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  if (data.componentType < 1 || data.componentType > 10) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  if (!data.componentName || data.componentName.length === 0) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  if (!data.manufacturer || data.manufacturer.length === 0) {
    return { success: false, error: "ERR-INVALID-INPUT" }
  }
  
  const facility = state.recoveryFacilities.get(data.extractionFacility)
  if (!facility || !facility.isActive) {
    return { success: false, error: "ERR-FACILITY-NOT-CERTIFIED" }
  }
  
  const componentId = state.nextComponentId++
  const component = {
    ...data,
    extractionDate: Date.now(),
    extractedBy: "test-principal",
    currentStatus: 1, // STATUS-EXTRACTED
    qualityGrade: null,
    estimatedValue: 0,
  }
  
  state.recoveredComponents.set(componentId, component)
  
  return { success: true, componentId }
}

function conductQualityTest(state, data) {
  const component = state.recoveredComponents.get(data.componentId)
  if (!component) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  const facility = state.recoveryFacilities.get(data.testFacility)
  if (!facility || !facility.isActive) {
    return { success: false, error: "ERR-FACILITY-NOT-CERTIFIED" }
  }
  
  const testId = state.nextTestId++
  const test = {
    ...data,
    testDate: Date.now(),
    testedBy: "test-principal",
  }
  
  state.qualityTests.set(testId, test)
  
  component.currentStatus = 2 // STATUS-TESTING
  
  return { success: true, testId }
}

function assignQualityGrade(state, data) {
  const component = state.recoveredComponents.get(data.componentId)
  if (!component) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  if (data.qualityGrade < 1 || data.qualityGrade > 5) {
    return { success: false, error: "ERR-INVALID-GRADE" }
  }
  
  component.qualityGrade = data.qualityGrade
  component.estimatedValue = data.estimatedValue
  component.currentStatus = 4 // STATUS-CERTIFIED
  
  return { success: true }
}

function startRefurbishment(state, data) {
  const component = state.recoveredComponents.get(data.componentId)
  if (!component) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  const facility = state.recoveryFacilities.get(data.refurbishmentFacility)
  if (!facility || !facility.isActive) {
    return { success: false, error: "ERR-FACILITY-NOT-CERTIFIED" }
  }
  
  const refurbishment = {
    refurbishmentFacility: data.refurbishmentFacility,
    startDate: Date.now(),
    completionDate: null,
    processesPerformed: data.processesPlanned,
    partsReplaced: "",
    laborHours: 0,
    refurbishmentCost: 0,
    finalGrade: null,
    technician: "test-principal",
    notes: "",
  }
  
  state.refurbishmentRecords.set(data.componentId, refurbishment)
  
  component.currentStatus = 3 // STATUS-REFURBISHING
  
  return { success: true }
}

function completeRefurbishment(state, data) {
  const refurbishment = state.refurbishmentRecords.get(data.componentId)
  if (!refurbishment) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  const component = state.recoveredComponents.get(data.componentId)
  if (!component) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  if (data.finalGrade < 1 || data.finalGrade > 5) {
    return { success: false, error: "ERR-INVALID-GRADE" }
  }
  
  refurbishment.completionDate = Date.now()
  refurbishment.partsReplaced = data.partsReplaced
  refurbishment.laborHours = data.laborHours
  refurbishment.refurbishmentCost = data.refurbishmentCost
  refurbishment.finalGrade = data.finalGrade
  refurbishment.notes = data.notes
  
  component.currentStatus = 5 // STATUS-AVAILABLE
  component.qualityGrade = data.finalGrade
  
  return { success: true }
}

function sellComponent(state, data) {
  const component = state.recoveredComponents.get(data.componentId)
  if (!component) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  if (component.currentStatus !== 5) {
    // STATUS-AVAILABLE
    return { success: false, error: "ERR-INVALID-STATUS" }
  }
  
  const sale = {
    ...data,
    saleDate: Date.now(),
    seller: "test-principal",
    transactionHash: "placeholder-hash",
  }
  
  state.secondaryMarketSales.set(data.componentId, sale)
  
  component.currentStatus = 6 // STATUS-SOLD
  
  return { success: true }
}

function processForMaterialRecovery(state, data) {
  const component = state.recoveredComponents.get(data.componentId)
  if (!component) {
    return { success: false, error: "ERR-COMPONENT-NOT-FOUND" }
  }
  
  const facility = state.recoveryFacilities.get(data.recoveryFacility)
  if (!facility || !facility.isActive) {
    return { success: false, error: "ERR-FACILITY-NOT-CERTIFIED" }
  }
  
  const recovery = {
    ...data,
    recoveryDate: Date.now(),
    processedBy: "test-principal",
  }
  
  state.materialRecovery.set(data.componentId, recovery)
  
  component.currentStatus = 7 // STATUS-RECYCLED
  
  return { success: true }
}
