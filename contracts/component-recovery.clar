;; Electronic Waste Management - Component Recovery Contract
;; Manages component extraction, refurbishment, quality assessment, and reuse tracking

;; Constants
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u400))
(define-constant ERR-DEVICE-NOT-FOUND (err u401))
(define-constant ERR-COMPONENT-NOT-FOUND (err u402))
(define-constant ERR-INVALID-INPUT (err u403))
(define-constant ERR-INVALID-GRADE (err u404))
(define-constant ERR-FACILITY-NOT-CERTIFIED (err u405))
(define-constant ERR-COMPONENT-ALREADY-PROCESSED (err u406))
(define-constant ERR-INVALID-STATUS (err u407))

;; Component Types
(define-constant TYPE-PROCESSOR u1)
(define-constant TYPE-MEMORY u2)
(define-constant TYPE-STORAGE u3)
(define-constant TYPE-DISPLAY u4)
(define-constant TYPE-BATTERY u5)
(define-constant TYPE-CIRCUIT-BOARD u6)
(define-constant TYPE-RARE-EARTH-METALS u7)
(define-constant TYPE-PRECIOUS-METALS u8)
(define-constant TYPE-PLASTIC u9)
(define-constant TYPE-OTHER u10)

;; Quality Grades
(define-constant GRADE-A u1) ;; Excellent - ready for reuse
(define-constant GRADE-B u2) ;; Good - minor refurbishment needed
(define-constant GRADE-C u3) ;; Fair - major refurbishment needed
(define-constant GRADE-D u4) ;; Poor - material recovery only
(define-constant GRADE-F u5) ;; Failed - disposal required

;; Component Status
(define-constant STATUS-EXTRACTED u1)
(define-constant STATUS-TESTING u2)
(define-constant STATUS-REFURBISHING u3)
(define-constant STATUS-CERTIFIED u4)
(define-constant STATUS-AVAILABLE u5)
(define-constant STATUS-SOLD u6)
(define-constant STATUS-RECYCLED u7)

;; Data Variables
(define-data-var next-component-id uint u1)
(define-data-var next-facility-id uint u1)
(define-data-var next-batch-id uint u1)
(define-data-var next-test-id uint u1)

;; Data Maps
(define-map recovered-components
  { component-id: uint }
  {
    source-device-id: uint,
    component-type: uint,
    component-name: (string-ascii 100),
    manufacturer: (string-ascii 100),
    model-number: (string-ascii 50),
    serial-number: (optional (string-ascii 50)),
    extraction-date: uint,
    extracted-by: principal,
    extraction-facility: uint,
    current-status: uint,
    quality-grade: (optional uint),
    estimated-value: uint,
    specifications: (string-ascii 500),
    condition-notes: (string-ascii 1000)
  }
)

(define-map recovery-facilities
  { facility-id: uint }
  {
    name: (string-ascii 100),
    location: (string-ascii 200),
    certification-level: uint,
    specializations: (list 10 uint),
    contact-info: (string-ascii 200),
    certified-by: principal,
    certification-date: uint,
    is-active: bool
  }
)

(define-map refurbishment-records
  { component-id: uint }
  {
    refurbishment-facility: uint,
    start-date: uint,
    completion-date: (optional uint),
    processes-performed: (string-ascii 500),
    parts-replaced: (string-ascii 300),
    labor-hours: uint,
    refurbishment-cost: uint,
    final-grade: (optional uint),
    technician: principal,
    notes: (string-ascii 1000)
  }
)

(define-map quality-tests
  { test-id: uint }
  {
    component-id: uint,
    test-type: (string-ascii 100),
    test-date: uint,
    test-facility: uint,
    test-parameters: (string-ascii 500),
    test-results: (string-ascii 1000),
    pass-fail: bool,
    tested-by: principal,
    certification-standard: (string-ascii 100)
  }
)

(define-map component-batches
  { batch-id: uint }
  {
    batch-name: (string-ascii 100),
    component-type: uint,
    total-components: uint,
    processing-facility: uint,
    batch-date: uint,
    estimated-total-value: uint,
    processing-status: uint,
    created-by: principal
  }
)

(define-map secondary-market-sales
  { component-id: uint }
  {
    buyer: principal,
    sale-price: uint,
    sale-date: uint,
    warranty-period: uint,
    sale-platform: (string-ascii 100),
    seller: principal,
    transaction-hash: (string-ascii 64)
  }
)

(define-map material-recovery
  { component-id: uint }
  {
    recovery-method: (string-ascii 100),
    materials-recovered: (string-ascii 500),
    recovery-yield: uint,
    recovery-facility: uint,
    recovery-date: uint,
    environmental-impact: (string-ascii 300),
    processed-by: principal
  }
)

;; Authorization Functions
(define-private (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

(define-private (is-certified-facility (facility-id uint))
  (match (map-get? recovery-facilities { facility-id: facility-id })
    facility-data (and (get is-active facility-data) (> (get certification-date facility-data) u0))
    false
  )
)

(define-private (is-authorized-for-component (component-id uint))
  (match (map-get? recovered-components { component-id: component-id })
    component-data (or (is-eq tx-sender (get extracted-by component-data))
                       (is-contract-owner))
    false
  )
)

;; Facility Management Functions
(define-public (register-recovery-facility
  (name (string-ascii 100))
  (location (string-ascii 200))
  (certification-level uint)
  (specializations (list 10 uint))
  (contact-info (string-ascii 200)))
  (let
    (
      (facility-id (var-get next-facility-id))
      (current-block-height block-height)
    )
    ;; Validate input
    (asserts! (> (len name) u0) ERR-INVALID-INPUT)
    (asserts! (> (len location) u0) ERR-INVALID-INPUT)
    (asserts! (and (>= certification-level u1) (<= certification-level u5)) ERR-INVALID-INPUT)

    ;; Register facility
    (map-set recovery-facilities
      { facility-id: facility-id }
      {
        name: name,
        location: location,
        certification-level: certification-level,
        specializations: specializations,
        contact-info: contact-info,
        certified-by: tx-sender,
        certification-date: u0,
        is-active: false
      }
    )

    ;; Increment facility ID
    (var-set next-facility-id (+ facility-id u1))

    (ok facility-id)
  )
)

(define-public (certify-facility (facility-id uint))
  (let
    (
      (facility-data (unwrap! (map-get? recovery-facilities { facility-id: facility-id }) ERR-DEVICE-NOT-FOUND))
      (current-block-height block-height)
    )
    ;; Only contract owner can certify facilities
    (asserts! (is-contract-owner) ERR-NOT-AUTHORIZED)

    ;; Update certification
    (map-set recovery-facilities
      { facility-id: facility-id }
      (merge facility-data {
        certified-by: tx-sender,
        certification-date: current-block-height,
        is-active: true
      })
    )

    (ok true)
  )
)

;; Component Extraction Functions
(define-public (extract-component
  (source-device-id uint)
  (component-type uint)
  (component-name (string-ascii 100))
  (manufacturer (string-ascii 100))
  (model-number (string-ascii 50))
  (serial-number (optional (string-ascii 50)))
  (extraction-facility uint)
  (specifications (string-ascii 500))
  (condition-notes (string-ascii 1000)))
  (let
    (
      (component-id (var-get next-component-id))
      (current-block-height block-height)
    )
    ;; Validate input
    (asserts! (> source-device-id u0) ERR-INVALID-INPUT)
    (asserts! (and (>= component-type TYPE-PROCESSOR) (<= component-type TYPE-OTHER)) ERR-INVALID-INPUT)
    (asserts! (> (len component-name) u0) ERR-INVALID-INPUT)
    (asserts! (> (len manufacturer) u0) ERR-INVALID-INPUT)

    ;; Validate facility certification
    (asserts! (is-certified-facility extraction-facility) ERR-FACILITY-NOT-CERTIFIED)

    ;; Extract component
    (map-set recovered-components
      { component-id: component-id }
      {
        source-device-id: source-device-id,
        component-type: component-type,
        component-name: component-name,
        manufacturer: manufacturer,
        model-number: model-number,
        serial-number: serial-number,
        extraction-date: current-block-height,
        extracted-by: tx-sender,
        extraction-facility: extraction-facility,
        current-status: STATUS-EXTRACTED,
        quality-grade: none,
        estimated-value: u0,
        specifications: specifications,
        condition-notes: condition-notes
      }
    )

    ;; Increment component ID
    (var-set next-component-id (+ component-id u1))

    (ok component-id)
  )
)

;; Quality Assessment Functions
(define-public (conduct-quality-test
  (component-id uint)
  (test-type (string-ascii 100))
  (test-facility uint)
  (test-parameters (string-ascii 500))
  (test-results (string-ascii 1000))
  (pass-fail bool)
  (certification-standard (string-ascii 100)))
  (let
    (
      (component-data (unwrap! (map-get? recovered-components { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
      (test-id (var-get next-test-id))
      (current-block-height block-height)
    )
    ;; Validate facility certification
    (asserts! (is-certified-facility test-facility) ERR-FACILITY-NOT-CERTIFIED)

    ;; Validate authorization
    (asserts! (is-authorized-for-component component-id) ERR-NOT-AUTHORIZED)

    ;; Record quality test
    (map-set quality-tests
      { test-id: test-id }
      {
        component-id: component-id,
        test-type: test-type,
        test-date: current-block-height,
        test-facility: test-facility,
        test-parameters: test-parameters,
        test-results: test-results,
        pass-fail: pass-fail,
        tested-by: tx-sender,
        certification-standard: certification-standard
      }
    )

    ;; Update component status
    (map-set recovered-components
      { component-id: component-id }
      (merge component-data { current-status: STATUS-TESTING })
    )

    ;; Increment test ID
    (var-set next-test-id (+ test-id u1))

    (ok test-id)
  )
)

(define-public (assign-quality-grade
  (component-id uint)
  (quality-grade uint)
  (estimated-value uint))
  (let
    (
      (component-data (unwrap! (map-get? recovered-components { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
    )
    ;; Validate grade
    (asserts! (and (>= quality-grade GRADE-A) (<= quality-grade GRADE-F)) ERR-INVALID-GRADE)

    ;; Validate authorization
    (asserts! (is-authorized-for-component component-id) ERR-NOT-AUTHORIZED)

    ;; Update component grade and value
    (map-set recovered-components
      { component-id: component-id }
      (merge component-data {
        quality-grade: (some quality-grade),
        estimated-value: estimated-value,
        current-status: STATUS-CERTIFIED
      })
    )

    (ok true)
  )
)

;; Refurbishment Functions
(define-public (start-refurbishment
  (component-id uint)
  (refurbishment-facility uint)
  (processes-planned (string-ascii 500)))
  (let
    (
      (component-data (unwrap! (map-get? recovered-components { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
      (current-block-height block-height)
    )
    ;; Validate facility certification
    (asserts! (is-certified-facility refurbishment-facility) ERR-FACILITY-NOT-CERTIFIED)

    ;; Validate authorization
    (asserts! (is-authorized-for-component component-id) ERR-NOT-AUTHORIZED)

    ;; Start refurbishment record
    (map-set refurbishment-records
      { component-id: component-id }
      {
        refurbishment-facility: refurbishment-facility,
        start-date: current-block-height,
        completion-date: none,
        processes-performed: processes-planned,
        parts-replaced: "",
        labor-hours: u0,
        refurbishment-cost: u0,
        final-grade: none,
        technician: tx-sender,
        notes: ""
      }
    )

    ;; Update component status
    (map-set recovered-components
      { component-id: component-id }
      (merge component-data { current-status: STATUS-REFURBISHING })
    )

    (ok true)
  )
)

(define-public (complete-refurbishment
  (component-id uint)
  (parts-replaced (string-ascii 300))
  (labor-hours uint)
  (refurbishment-cost uint)
  (final-grade uint)
  (notes (string-ascii 1000)))
  (let
    (
      (refurbishment-data (unwrap! (map-get? refurbishment-records { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
      (component-data (unwrap! (map-get? recovered-components { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
      (current-block-height block-height)
    )
    ;; Validate grade
    (asserts! (and (>= final-grade GRADE-A) (<= final-grade GRADE-F)) ERR-INVALID-GRADE)

    ;; Validate authorization
    (asserts! (is-authorized-for-component component-id) ERR-NOT-AUTHORIZED)

    ;; Complete refurbishment record
    (map-set refurbishment-records
      { component-id: component-id }
      (merge refurbishment-data {
        completion-date: (some current-block-height),
        parts-replaced: parts-replaced,
        labor-hours: labor-hours,
        refurbishment-cost: refurbishment-cost,
        final-grade: (some final-grade),
        notes: notes
      })
    )

    ;; Update component
    (map-set recovered-components
      { component-id: component-id }
      (merge component-data {
        current-status: STATUS-AVAILABLE,
        quality-grade: (some final-grade)
      })
    )

    (ok true)
  )
)

;; Secondary Market Functions
(define-public (sell-component
  (component-id uint)
  (buyer principal)
  (sale-price uint)
  (warranty-period uint)
  (sale-platform (string-ascii 100)))
  (let
    (
      (component-data (unwrap! (map-get? recovered-components { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
      (current-block-height block-height)
      (transaction-hash "placeholder-hash") ;; In real implementation, generate actual hash
    )
    ;; Validate component is available for sale
    (asserts! (is-eq (get current-status component-data) STATUS-AVAILABLE) ERR-INVALID-STATUS)

    ;; Validate authorization
    (asserts! (is-authorized-for-component component-id) ERR-NOT-AUTHORIZED)

    ;; Record sale
    (map-set secondary-market-sales
      { component-id: component-id }
      {
        buyer: buyer,
        sale-price: sale-price,
        sale-date: current-block-height,
        warranty-period: warranty-period,
        sale-platform: sale-platform,
        seller: tx-sender,
        transaction-hash: transaction-hash
      }
    )

    ;; Update component status
    (map-set recovered-components
      { component-id: component-id }
      (merge component-data { current-status: STATUS-SOLD })
    )

    (ok true)
  )
)

;; Material Recovery Functions
(define-public (process-for-material-recovery
  (component-id uint)
  (recovery-method (string-ascii 100))
  (materials-recovered (string-ascii 500))
  (recovery-yield uint)
  (recovery-facility uint)
  (environmental-impact (string-ascii 300)))
  (let
    (
      (component-data (unwrap! (map-get? recovered-components { component-id: component-id }) ERR-COMPONENT-NOT-FOUND))
      (current-block-height block-height)
    )
    ;; Validate facility certification
    (asserts! (is-certified-facility recovery-facility) ERR-FACILITY-NOT-CERTIFIED)

    ;; Validate authorization
    (asserts! (is-authorized-for-component component-id) ERR-NOT-AUTHORIZED)

    ;; Record material recovery
    (map-set material-recovery
      { component-id: component-id }
      {
        recovery-method: recovery-method,
        materials-recovered: materials-recovered,
        recovery-yield: recovery-yield,
        recovery-facility: recovery-facility,
        recovery-date: current-block-height,
        environmental-impact: environmental-impact,
        processed-by: tx-sender
      }
    )

    ;; Update component status
    (map-set recovered-components
      { component-id: component-id }
      (merge component-data { current-status: STATUS-RECYCLED })
    )

    (ok true)
  )
)

;; Query Functions
(define-read-only (get-component (component-id uint))
  (map-get? recovered-components { component-id: component-id })
)

(define-read-only (get-facility (facility-id uint))
  (map-get? recovery-facilities { facility-id: facility-id })
)

(define-read-only (get-refurbishment-record (component-id uint))
  (map-get? refurbishment-records { component-id: component-id })
)

(define-read-only (get-quality-test (test-id uint))
  (map-get? quality-tests { test-id: test-id })
)

(define-read-only (get-component-sale (component-id uint))
  (map-get? secondary-market-sales { component-id: component-id })
)

(define-read-only (get-material-recovery (component-id uint))
  (map-get? material-recovery { component-id: component-id })
)

;; Statistics Functions
(define-read-only (get-total-components)
  (- (var-get next-component-id) u1)
)

(define-read-only (get-total-facilities)
  (- (var-get next-facility-id) u1)
)

(define-read-only (get-total-tests)
  (- (var-get next-test-id) u1)
)

(define-read-only (get-component-status (component-id uint))
  (match (get-component component-id)
    component-data (some (get current-status component-data))
    none
  )
)

(define-read-only (get-component-grade (component-id uint))
  (match (get-component component-id)
    component-data (get quality-grade component-data)
    none
  )
)
