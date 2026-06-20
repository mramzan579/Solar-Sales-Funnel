// Project 4 - Solar Lead Gen Platform - Main Scripts

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       EXIT INTENT POPUP
    ========================================= */
    const exitPopup = document.getElementById('exitPopup');
    const closeExitPopup = document.getElementById('closeExitPopup');
    const exitCtaBtn = document.getElementById('exitCtaBtn');
    let popupShown = false;

    // Trigger on mouse leave towards top
    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !popupShown) {
            // Check session storage so it doesn't annoy users on reload
            if (!sessionStorage.getItem('exitPopupShown')) {
                exitPopup.classList.add('active');
                popupShown = true;
                sessionStorage.setItem('exitPopupShown', 'true');
            }
        }
    });

    const closePopup = () => {
        exitPopup.classList.remove('active');
    };

    closeExitPopup.addEventListener('click', closePopup);
    exitCtaBtn.addEventListener('click', closePopup);
    exitPopup.addEventListener('click', (e) => {
        if (e.target === exitPopup) closePopup();
    });


    /* =========================================
       SOLAR READINESS CHECK (UPGRADE 10)
    ========================================= */
    window.nextStep = function(stepNum) {
        // Hide all steps
        document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
        // Show target step
        document.getElementById(`step${stepNum}`).style.display = 'block';
        document.getElementById(`step${stepNum}`).classList.add('active');
    };

    window.showReadinessResult = function() {
        document.querySelectorAll('.step').forEach(el => el.style.display = 'none');
        document.getElementById('stepResult').style.display = 'block';
        document.getElementById('stepResult').classList.add('active');
    };


    /* =========================================
       LIVE SAVINGS CALCULATOR & DASHBOARD
    ========================================= */
    const calcBill = document.getElementById('calcBill');
    const calcBillSlider = document.getElementById('calcBillSlider');
    const calcCity = document.getElementById('calcCity');
    const calcPropType = document.getElementById('calcPropType');
    const btnCalculate = document.getElementById('btnCalculate');

    // Outputs
    const outSysSize = document.getElementById('outSysSize');
    const outMoSavings = document.getElementById('outMoSavings');
    const outYrSavings = document.getElementById('outYrSavings');
    const out10YrSavings = document.getElementById('out10YrSavings');
    const outPayback = document.getElementById('outPayback');
    const recInverter = document.getElementById('recInverter');
    const recPanels = document.getElementById('recPanels');
    const roiChart = document.getElementById('roiChart');

    // Sync input and slider
    calcBill.addEventListener('input', (e) => calcBillSlider.value = e.target.value);
    calcBillSlider.addEventListener('input', (e) => calcBill.value = e.target.value);

    const calculateSavings = () => {
        const bill = parseFloat(calcBill.value) || 150;
        const sunFactor = parseFloat(calcCity.value) || 0.85;
        const type = calcPropType.value;

        // Basic estimation math
        // Avg cost of electricity ~$0.15/kWh. 
        // Mo Usage = bill / 0.15
        const moUsage = bill / 0.15; 
        
        // System size in kW ~ (Mo Usage / 30 days / 4 sun hours) / sunFactor
        let sysSize = (moUsage / 30 / 4) / sunFactor;
        
        if (sysSize < 2) sysSize = 2; // Min size

        // Calculate Savings
        // Assume solar offsets 90% of bill
        const moSavings = bill * 0.90;
        const yrSavings = moSavings * 12;
        const tenYrSavings = yrSavings * 10;

        // Cost estimation: ~$2.80 per watt
        const sysCost = sysSize * 1000 * 2.80;
        
        // Payback
        const payback = sysCost / yrSavings;

        // Update UI
        outSysSize.innerText = sysSize.toFixed(1) + ' kW';
        outMoSavings.innerText = '$' + Math.round(moSavings).toLocaleString();
        outYrSavings.innerText = '$' + Math.round(yrSavings).toLocaleString();
        out10YrSavings.innerText = '$' + Math.round(tenYrSavings).toLocaleString();
        outPayback.innerText = payback.toFixed(1) + ' Years';

        // Recommendations
        if (type === 'residential') {
            recInverter.innerText = sysSize > 8 ? 'Microinverter' : 'String Inverter';
            recPanels.innerText = 'High-Efficiency Monocrystalline';
        } else if (type === 'commercial') {
            recInverter.innerText = 'Commercial 3-Phase Inverter';
            recPanels.innerText = 'High-Yield Commercial Panels';
        } else {
            recInverter.innerText = 'Heavy-Duty Industrial Inverter';
            recPanels.innerText = 'Bifacial Industrial Panels';
        }

        // Draw ROI Visualization
        drawROI(sysCost, yrSavings);
        
        // Update Financing Cost Input
        const finCostInput = document.getElementById('finCost');
        if (finCostInput) {
            finCostInput.value = Math.round(sysCost);
            calculateFinancing(); // update financing as well
        }
    };

    const drawROI = (cost, yrSavings) => {
        roiChart.innerHTML = '';
        const years = 20;
        const maxVal = Math.max(cost, yrSavings * years);
        
        for (let i = 1; i <= years; i++) {
            const currentSavings = yrSavings * i;
            
            const group = document.createElement('div');
            group.className = 'bar-group';
            
            const costBar = document.createElement('div');
            costBar.className = 'bar bar-cost';
            costBar.style.height = `${(cost / maxVal) * 100}%`;
            
            const savingsBar = document.createElement('div');
            savingsBar.className = 'bar bar-savings';
            savingsBar.style.height = `${(currentSavings / maxVal) * 100}%`;

            // Tooltip or title for hover
            group.title = `Year ${i}: Savings $${Math.round(currentSavings).toLocaleString()}`;
            
            group.appendChild(costBar);
            group.appendChild(savingsBar);
            roiChart.appendChild(group);
        }
    };

    btnCalculate.addEventListener('click', calculateSavings);

    // Initial calculation
    calculateSavings();


    /* =========================================
       FINANCING SIMULATOR (UPGRADE 9)
    ========================================= */
    const finCost = document.getElementById('finCost');
    const finType = document.getElementById('finType');
    const finCashResult = document.getElementById('finCashResult');
    const finLoanResult = document.getElementById('finLoanResult');
    const outPocket = document.getElementById('outPocket');
    const outMoPayment = document.getElementById('outMoPayment');

    const calculateFinancing = () => {
        const cost = parseFloat(finCost.value) || 15000;
        const type = finType.value;

        if (type === 'cash') {
            finCashResult.style.display = 'block';
            finLoanResult.style.display = 'none';
            outPocket.innerText = '$' + cost.toLocaleString();
        } else {
            finCashResult.style.display = 'none';
            finLoanResult.style.display = 'block';
            
            // Basic loan math: 
            // 10 year @ 6.99%, 20 year @ 7.99%
            const years = type === 'loan10' ? 10 : 20;
            const rate = type === 'loan10' ? 0.0699 : 0.0799;
            const months = years * 12;
            const monthlyRate = rate / 12;
            
            // Amortization formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1 ]
            const p = cost;
            const i = monthlyRate;
            const n = months;
            const payment = p * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            
            outMoPayment.innerText = '$' + Math.round(payment) + ' / mo';
        }
    };

    finCost.addEventListener('input', calculateFinancing);
    finType.addEventListener('change', calculateFinancing);
    calculateFinancing();


    /* =========================================
       LEAD GEN FORM & SUCCESS POPUP
    ========================================= */
    const leadForm = document.getElementById('leadForm');
    const successModal = document.getElementById('successModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const phoneErrorModal = document.getElementById('phoneErrorModal');
    const closePhoneErrorModal = document.getElementById('closePhoneErrorModal');

    // Phone Number Verification Setup
    const phoneInput = document.querySelector("#phone");
    let iti;
    
    if (window.intlTelInput) {
        iti = window.intlTelInput(phoneInput, {
            initialCountry: "pk",
            separateDialCode: true,
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
        });
    }

    const closeModals = () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    };

    closeSuccessModal.addEventListener('click', () => {
        closeModals();
        leadForm.reset();
    });
    
    closePhoneErrorModal.addEventListener('click', closeModals);

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModals();
        });
    });

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        
        // Validate Phone Number
        if (iti) {
            if (!iti.isValidNumber()) {
                phoneErrorModal.classList.add('active');
                return; // Stop form submission
            }
        } else if (phoneInput) {
            // Fallback if library failed to load
            const val = phoneInput.value.replace(/\D/g, '');
            if (val.length !== 10) {
                phoneErrorModal.classList.add('active');
                return; // Stop form submission
            }
        }

        successModal.classList.add('active');
    });

    const closeModal = () => {
        successModal.classList.remove('active');
        leadForm.reset();
    };

    closeSuccessModal.addEventListener('click', closeModal);
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) closeModal();
    });


    /* =========================================
       ANIMATED COUNTERS (IMPACT SECTION)
    ========================================= */
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText.replace(/,/g, ''); // handle commas
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc).toLocaleString();
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target.toLocaleString() + (counter.parentElement.innerText.includes('Capacity') ? '+' : '');
                }
            };
            updateCount();
        });
    };

    // Intersection Observer to trigger counters when visible
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                obs.disconnect(); // Only run once
            }
        });
    }, { threshold: 0.5 });

    const impactSection = document.querySelector('.impact');
    if (impactSection) {
        observer.observe(impactSection);
    }
});
