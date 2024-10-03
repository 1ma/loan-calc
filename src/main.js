import * as echarts from 'echarts/core';
import {PieChart} from 'echarts/charts';
import {TitleComponent} from "echarts/components";
import {CanvasRenderer} from 'echarts/renderers';

echarts.use([
    PieChart,
    TitleComponent,
    CanvasRenderer
]);

const DEFAULT_DEBOUNCE_WAIT = 200;

const debounce = (callback, wait = DEFAULT_DEBOUNCE_WAIT) => {
    let timeoutId = null;

    return (...args) => {
        window.clearTimeout(timeoutId);

        timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}

let lang = document.documentElement.lang;
let options = {
    minimumFractionDigits: 2
};

let calcOptions = document.querySelector('.calc-options');
let paybackTypeBlock = calcOptions.querySelector('.calc-options__item--payback-type');
let paybackTypeOptions = paybackTypeBlock.querySelectorAll('.calc-options__radio-label');
paybackTypeOptions.forEach((paybackTypeItem => {
    paybackTypeItem.addEventListener('click', () => {
        paybackTypeOptions.forEach((item => {
            item.classList.remove('calc-options__radio-label--active');
        }));
        paybackTypeItem.classList.add('calc-options__radio-label--active');
    });
}));

let paymentFrequencyBlock = calcOptions.querySelector('.calc-options__item--payment-frequency');
let paymentFrequencyOptions = paymentFrequencyBlock.querySelectorAll('.calc-options__radio-label');
paymentFrequencyOptions.forEach((paymentFrequencyItem => {
    paymentFrequencyItem.addEventListener('click', () => {
        paymentFrequencyOptions.forEach((item => {
            item.classList.remove('calc-options__radio-label--active');
        }));
        paymentFrequencyItem.classList.add('calc-options__radio-label--active');
    });
}));

let calcTabs = document.querySelector('.calc-tabs');
let calcTabsContentChart = calcTabs.querySelector('[js-content-chart]');
let calcTabsContentBreakdown = calcTabs.querySelector('[js-content-breakdown]');
let calcTabsMenu = calcTabs.querySelector('.calc-tabs__menu');
let calcTabsMenuChart = calcTabsMenu.querySelector('[js-menu-chart]');
let calcTabsMenuBreakdown = calcTabsMenu.querySelector('[js-menu-breakdown]');

calcTabsMenuChart.addEventListener('click', () => {
    calcTabsMenuChart.classList.add('calc-tabs__menu-item--active');
    calcTabsMenuBreakdown.classList.remove('calc-tabs__menu-item--active');
    calcTabsContentChart.classList.remove('is-hidden');
    calcTabsContentBreakdown.classList.add('is-hidden');
});
calcTabsMenuBreakdown.addEventListener('click', () => {
    calcTabsMenuChart.classList.remove('calc-tabs__menu-item--active');
    calcTabsMenuBreakdown.classList.add('calc-tabs__menu-item--active');
    calcTabsContentChart.classList.add('is-hidden');
    calcTabsContentBreakdown.classList.remove('is-hidden');
});

let interestResultElem = calcTabs.querySelector('[js-interest]');
let interestValueElement = calcOptions.querySelector('[js-interest-value]');

let interestValue = interestValueElement.value;
let interestValueMin = Number(interestValueElement.getAttribute('min'));
let interestValueStr = interestValue + '%';
interestResultElem.innerHTML = interestValueStr;

let periodResultElem = calcTabs.querySelector('[js-loan-period-result]');
let periodValueElement = calcOptions.querySelector('[js-loan-period-value]');
let periodValue = periodValueElement.value;
let periodValueMin = Number(periodValueElement.getAttribute('min'));
let periodTokenElement = calcOptions.querySelector('[js-loan-period-select]');
let periodTokenValue = periodTokenElement.options[periodTokenElement.selectedIndex].value;
let periodTokenText = periodTokenElement.options[periodTokenElement.selectedIndex].text;

periodResultElem.innerHTML = periodValue + ' ' + periodTokenText;
periodValueElement.addEventListener('input', debounce(() => {
    periodValue = Number(periodValueElement.value);
    if (periodValue < periodValueMin) {
        periodValue = periodValueMin;
    }
    periodValueElement.value = periodValue;
    periodTokenText = periodTokenElement.options[periodTokenElement.selectedIndex].text;
    periodResultElem.innerHTML = periodValue + ' ' + periodTokenText;
    updateMyChart(
        paybackType,
        loanAmountValue,
        periodTokenValue,
        periodValueElement.value,
        paymentInterval,
        interestValue,
        startingFee,
        monthlyFee
    );
}));

periodTokenElement.addEventListener('change', () => {
    periodTokenValue = periodTokenElement.options[periodTokenElement.selectedIndex].value;
    periodTokenText = periodTokenElement.options[periodTokenElement.selectedIndex].text;
    periodResultElem.innerHTML = periodValue + ' ' + periodTokenText;
    updateMyChart(
        paybackType,
        loanAmountValue,
        periodTokenElement.value,
        periodValue,
        paymentInterval,
        interestValue,
        startingFee,
        monthlyFee
    );
});

let loanResultElement = calcTabs.querySelector('[js-loan-result]');
let loanAmountValueElement = calcOptions.querySelector('[js-loan-amount-value]');
let loanAmountValue = Number(loanAmountValueElement.value);
let loanAmountMin = Number(loanAmountValueElement.getAttribute('min'));
loanResultElement.innerHTML = parseFloat(loanAmountValue.toFixed(2)).toLocaleString(lang, options);

loanAmountValueElement.addEventListener('input', debounce(() => {
    loanAmountValue = Number(loanAmountValueElement.value);
    if (loanAmountValue < loanAmountMin) {
        loanAmountValue = loanAmountMin;
    }
    loanAmountValueElement.value = loanAmountValue;
    loanResultElement.innerHTML = parseFloat(loanAmountValue.toFixed(2)).toLocaleString(lang, options);
    updateMyChart(
        paybackType,
        loanAmountValueElement.value,
        periodTokenValue,
        periodValue,
        paymentInterval,
        interestValue,
        startingFee,
        monthlyFee
    );
}));

interestValueElement.addEventListener('input', debounce(() => {
    interestValue = Number(interestValueElement.value);
    if (interestValue < interestValueMin) {
        interestValue = interestValueMin;
    }
    interestValueElement.value = interestValue;
    interestResultElem.innerHTML = interestValueElement.value + '%';
    updateMyChart(
        paybackType,
        loanAmountValue,
        periodTokenValue,
        periodValue,
        paymentInterval,
        interestValue,
        startingFee,
        monthlyFee
    );
}));

let duration = 0;
let startingFeeElem = calcOptions.querySelector('[js-starting-fee]');
let startingFee = parseFloat(startingFeeElem.value);
let startingFeeMin = Number(startingFeeElem.getAttribute('min'));

let monthlyFeeElem = calcOptions.querySelector('[js-monthly-fee]');
let monthlyFee = parseFloat(monthlyFeeElem.value);
let monthlyFeeMin = Number(monthlyFeeElem.getAttribute('min'));

let paymentInterval = 1;
let period = 12 / paymentInterval;
if (periodTokenValue === 'Years') {
    duration = periodValue * period
} else if (periodTokenValue === 'Months') {
    duration = periodValue / 12 * period;
}

let allFees = (startingFee + (monthlyFee * duration));

let allFeesResultElement = calcTabs.querySelector('[js-all-fees-result]');
allFeesResultElement.innerHTML = parseFloat(allFees.toFixed(2)).toLocaleString(lang, options);

let paymentFrequency = calcOptions.querySelectorAll('[js-payment-frequency]');
paymentFrequency.forEach(item => {
    item.addEventListener('click', () => {
        paymentInterval = item.value;
        updateMyChart(
            paybackType,
            loanAmountValue,
            periodTokenValue,
            periodValue,
            paymentInterval,
            interestValue,
            startingFee,
            monthlyFee
        );
    });
});

startingFeeElem.addEventListener('input', debounce(() => {
    startingFee = Number(startingFeeElem.value);
    if (startingFee < startingFeeMin) {
        startingFee = startingFeeMin;
    }
    startingFeeElem.value = startingFee;
    updateMyChart(
        paybackType,
        loanAmountValue,
        periodTokenValue,
        periodValue,
        paymentInterval,
        interestValue,
        startingFee,
        monthlyFee
    );
}));

monthlyFeeElem.addEventListener('input', debounce(() => {
    monthlyFee = Number(monthlyFeeElem.value);
    if (monthlyFee < monthlyFeeMin) {
        monthlyFee = monthlyFeeMin;
    }
    monthlyFeeElem.value = monthlyFee;
    updateMyChart(
        paybackType,
        loanAmountValue,
        periodTokenValue,
        periodValue,
        paymentInterval,
        interestValue,
        startingFee,
        monthlyFee
    );
}));

let totalInterest = 0;
let totalAmount = 0;
let time = 1;
let paybackTypeElements = calcOptions.querySelectorAll('[js-payback-type]');
let interest = interestValue / 100 / period;
let paybackType = 'annuity';

if (periodTokenValue === 'Years') {
    time = periodValue * period;
} else if (periodTokenValue === 'Months') {
    time = periodValue / 12 * period;
}

let powN = Math.pow(1 + parseFloat(interest), time);
let interestRateAmount;
let totalAnnuity = 0;
let totalPayments = 0;
let totalSum = 0;
let breakdownItems = [];

let annuity = loanAmountValue * ((interest * powN) / (powN - 1));
let loanAmountValueStr = loanAmountValue;
for (let currTime = 1; currTime <= time; currTime++) {
    interestRateAmount = interest * loanAmountValueStr;
    let currentAmount = annuity - interestRateAmount;
    loanAmountValueStr = (loanAmountValueStr - currentAmount) > 0 ? loanAmountValueStr - currentAmount : 0;
    breakdownItems.push({
        month: currTime * paymentInterval,
        amount: parseFloat(currentAmount.toFixed(2)).toLocaleString(lang, options) + "€",
        interest: parseFloat(interestRateAmount.toFixed(2)).toLocaleString(lang, options) + "€",
        annuity: parseFloat((annuity + monthlyFee).toFixed(2)).toLocaleString(lang, options) + "€",
        debt: parseFloat(loanAmountValueStr.toFixed(2)).toLocaleString(lang, options) + "€",
    });

    totalAmount += currentAmount;
    totalAnnuity += annuity;
    totalInterest += interestRateAmount;
}
totalPayments = totalAnnuity + allFees;

let breakdownItemsContainer = calcTabsContentBreakdown.querySelector('[js-breakdown-items]');
let breakdownHtml = '';
let breakdownColStart = '<div class="calc-breakdown__column">';
let breakdownEnd = '</div>';
let breakdownRowStart = '<div class="calc-breakdown__row">';


let dateOptionsMonth = {month: 'short'};

breakdownItems.forEach(item => {
    let nowDate = new Date();
    nowDate.setMonth(nowDate.getMonth() + parseInt(item.month));
    breakdownHtml += breakdownRowStart;
    breakdownHtml += breakdownColStart + nowDate.toLocaleString(lang, dateOptionsMonth) + ', '
        + nowDate.getFullYear() + breakdownEnd;
    breakdownHtml += breakdownColStart + item.amount + breakdownEnd;
    breakdownHtml += breakdownColStart + item.interest + breakdownEnd;
    breakdownHtml += breakdownColStart + item.annuity + breakdownEnd;
    breakdownHtml += breakdownColStart + '<strong>' + item.debt + '</strong>' + breakdownEnd;
    breakdownHtml += breakdownEnd;
});

breakdownItemsContainer.innerHTML = '';
breakdownItemsContainer.innerHTML = breakdownHtml;

paybackTypeElements.forEach(paybackTypeElement => {
    paybackTypeElement.addEventListener('click', function (evt) {
        paybackType = this.value;
        updateMyChart(
            paybackType,
            loanAmountValue,
            periodTokenValue,
            periodValue,
            paymentInterval,
            interestValue,
            startingFee,
            monthlyFee
        );
    });
});

function updateMyChart(
    paybackType,
    loanAmountValue = loanAmountValueElement.value,
    periodTokenValue = periodTokenElement.value,
    periodValue = periodValueElement.value,
    paymentInterval,
    interestValue = interestValueElement.value,
    startingFee = parseFloat(startingFeeElem.value),
    monthlyFee = parseFloat(monthlyFeeElem.value)
) {
    let loanAmountValueStr = loanAmountValue;
    let period = 12 / paymentInterval;
    if (periodTokenValue === 'Years') {
        time = periodValue * period;
        duration = periodValue * period
    } else if (periodTokenValue === 'Months') {
        time = periodValue / 12 * period;
        duration = periodValue / 12 * period;
    }
    let breakdownItems = [];
    if (paybackType === 'annuity') {
        totalAnnuity = 0;
        interestRateAmount = 0;
        totalInterest = 0;
        let interest = interestValue / 100 / period;
        let powN = Math.pow(1 + parseFloat(interest), time);
        let annuity = loanAmountValue * ((interest * powN) / (powN - 1));
        let loanAmountValueCalc = loanAmountValue;
        for (let currTime = 1; currTime <= time; currTime++) {
            interestRateAmount = interest * loanAmountValueCalc;
            let currentAmount = annuity - interestRateAmount;
            loanAmountValueCalc = (loanAmountValueCalc - currentAmount) > 0
                ? loanAmountValueCalc - currentAmount
                : 0;

            breakdownItems.push({
                month: currTime * paymentInterval,
                amount: parseFloat(currentAmount.toFixed(2)).toLocaleString(lang, options) + "€",
                interest: parseFloat(interestRateAmount.toFixed(2)).toLocaleString(lang, options) + "€",
                annuity: parseFloat((annuity + monthlyFee).toFixed(2)).toLocaleString(lang, options) + "€",
                debt: parseFloat(loanAmountValueCalc.toFixed(2)).toLocaleString(lang, options) + "€",
            });

            totalAmount += currentAmount;
            totalAnnuity += annuity;
            totalInterest += interestRateAmount;
        }
        totalPayments = totalAnnuity;
    } else if (paybackType === 'straight') {
        totalSum = 0;
        interestRateAmount = 0;
        totalInterest = 0;
        let amountSum = loanAmountValueStr / time;
        let interest = interestValue / 100 / period;
        let loanAmountValueCalc = loanAmountValueStr;
        for (let currTime = 1; currTime <= time; currTime++) {
            interestRateAmount = interest * loanAmountValueCalc;
            let totalToPay = interestRateAmount + amountSum;
            loanAmountValueCalc = loanAmountValueCalc - amountSum;

            breakdownItems.push({
                month: currTime * paymentInterval,
                amount: parseFloat(amountSum.toFixed(2)).toLocaleString(lang, options) + "€",
                interest: parseFloat(interestRateAmount.toFixed(2)).toLocaleString(lang, options) + "€",
                annuity: parseFloat(totalToPay.toFixed(2)).toLocaleString(lang, options) + "€",
                debt: parseFloat(loanAmountValueCalc.toFixed(2)).toLocaleString(lang, options) + "€",
            });

            totalAmount += amountSum;
            totalInterest += interestRateAmount;
            totalSum += totalToPay;
        }
        totalPayments = totalSum;
    }
    breakdownHtml = '';
    breakdownItems.forEach(item => {
        let nowDate = new Date();
        nowDate.setMonth(nowDate.getMonth() + parseInt(item.month));
        breakdownHtml += breakdownRowStart;
        breakdownHtml += breakdownColStart + nowDate.toLocaleString(lang, dateOptionsMonth) + ', '
            + nowDate.getFullYear() + breakdownEnd;
        breakdownHtml += breakdownColStart + item.amount + breakdownEnd;
        breakdownHtml += breakdownColStart + item.interest + breakdownEnd;
        breakdownHtml += breakdownColStart + item.annuity + breakdownEnd;
        breakdownHtml += breakdownColStart + '<strong>' + item.debt + '</strong>' + breakdownEnd;
        breakdownHtml += breakdownEnd;
    });

    breakdownItemsContainer.innerHTML = breakdownHtml;

    let allFees = (startingFee + (monthlyFee * duration));

    totalPayments = totalPayments + allFees;
    totalInterestResultElement.innerHTML = parseFloat(totalInterest.toFixed(2)).toLocaleString(lang, options);
    totalPaymentsResultElement.innerHTML = parseFloat(totalPayments.toFixed(2)).toLocaleString(lang, options);
    allFeesResultElement.innerHTML = parseFloat(allFees.toFixed(2)).toLocaleString(lang, options);
    loanAmountValueStr = Number(loanAmountValueStr);
    totalInterest = Math.round((totalInterest + 0.00001) * 100) / 100;
    loanAmountValueStr = Math.round((loanAmountValueStr + 0.00001) * 100) / 100;
    allFees = Math.round((allFees + 0.00001) * 100) / 100;

    let optionData = {
        baseOption: {
            series: [
                {
                    data: [
                        {value: totalInterest, name: 'Interest'},
                        {value: loanAmountValueStr, name: 'Loan'},
                        {value: allFees, name: 'Fees'}
                    ]
                }
            ]
        }
    };
    let subtext11 = parseFloat(totalPayments.toFixed(2)).toLocaleString(lang, options) + "€";
    let optionMediaTotal = {
        media: [
            {
                query: {minWidth: 450},
                option: {
                    title: {
                        subtext: subtext11
                    }
                }
            },
            {
                query: {maxWidth: 450},
                option: {
                    title: {
                        subtext: subtext11
                    }
                }
            }
        ]
    };

    myChart.setOption(optionData);
    myChart.setOption(optionMediaTotal);
}

let totalInterestResultElement = calcTabs.querySelector('[js-total-interest]');
let totalPaymentsResultElement = calcTabs.querySelector('[js-total-payments]');
totalInterestResultElement.innerHTML = parseFloat(totalInterest.toFixed(2)).toLocaleString(lang, options);
totalPaymentsResultElement.innerHTML = parseFloat(totalPayments.toFixed(2)).toLocaleString(lang, options);

totalInterest = Math.round((totalInterest + 0.00001) * 100) / 100;
loanAmountValue = Math.round((loanAmountValue + 0.00001) * 100) / 100;
allFees = Math.round((allFees + 0.00001) * 100) / 100;
let subtext11 = parseFloat(totalPayments.toFixed(2)).toLocaleString(lang, options) + "€";
let optionData = {
    baseOption: {
        series: [
            {
                data: [
                    {value: totalInterest, name: 'Interest'},
                    {value: loanAmountValue, name: 'Loan'},
                    {value: allFees, name: 'Fees'}
                ]
            }
        ]
    }
};
let optionBase = {
    baseOption: {
        textStyle: {
            fontFamily: 'Poppins, arial, sans-serif',
            fontWeight: 'lighter',
            fontSize: '14'
        },
        color: ['#fdce54', '#60d394', '#d34a4a'],
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                let formatted = (params.value).toLocaleString(lang, options);
                return params.name + ': ' + formatted + "€";
            }
        },
        series: [
            {
                type: 'pie',
                radius: '50%',
                animation: false,
                label: {
                    normal: {
                        position: 'outside',
                        alignTo: 'none',
                        show: true,
                        color: '#000000',
                        margin: '12%',
                        formatter: function (params) {
                            let formatted = (params.value).toLocaleString(lang, options);
                            return params.name + ': ' + formatted + ' ' + 'txt14';
                        }
                    }
                },
                labelLine: {
                    normal: {
                        show: true,
                        length: 100,
                        length2: 20,
                    }
                },
                startAngle: 110,
                center: ['50%', '50%'],
                selectedMode: 'single',
                itemStyle: {
                    borderColor: '#FFFFFF',
                    borderWidth: 3,
                    emphasis: {
                        borderWidth: 0,
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
            }
        ]
    }
};
let optionMedia = {
    media: [
        {
            query: {minWidth: 450},
            option: {
                title: {
                    text: 'Total',
                    subtext: subtext11,
                    left: '50%',
                    top: '40%',
                    textAlign: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#999999',
                    },
                    subtextStyle: {
                        fontSize: 34,
                        fontWeight: 'bold',
                        color: '#000000',
                    }
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['100%', '68%'],
                        top: 50,
                        bottom: 50,
                        label: {
                            normal: {
                                position: 'outside',
                                alignTo: 'none',
                                show: true,
                                color: '#000000',
                                margin: '12%',
                                fontSize: 14,
                                formatter: (params) => {
                                    let formatted = (params.value).toLocaleString(lang, options);
                                    return params.name + ': ' + formatted + "€";
                                }
                            },
                        },
                        labelLine: {
                            normal: {
                                show: true
                            }
                        }
                    }
                ]
            }
        },
        {
            query: {maxWidth: 450},
            option: {
                title: {
                    text: 'Total',
                    subtext: subtext11,
                    left: '50%',
                    top: '43%',
                    textAlign: 'center',
                    textStyle: {
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: '#999999',
                    },
                    subtextStyle: {
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#000000',
                    },
                },
                legend: {
                    orient: 'vertical',
                    left: 0,
                    bottom: 10,
                    textStyle: {
                        fontSize: 11,
                        fontWeight: 'normal',
                        color: '#999999',
                    },
                    itemWidth: 15,
                    itemHeight: 10,
                },
                series: [
                    {
                        animation: false,
                        type: 'pie',
                        radius: ['68%', '48%'],
                        label: {
                            normal: {
                                position: 'outside',
                                alignTo: 'edge',
                                margin: 0,
                                distanceToLabelLine: 0,
                                show: true,
                                color: '#999999',
                                fontSize: 11,
                                fontWeight: 'normal',
                                formatter: (params) => {
                                    return (params.value.toFixed()).toLocaleString() + "€";
                                }
                            }
                        },
                        labelLine: {
                            normal: {
                                show: true,
                                length: '12%',
                                length2: 5,
                            }
                        }
                    }
                ]
            }
        }
    ]
};

let myChart = echarts.init(document.getElementById('borrowing_cost_calculator'));
myChart.setOption(optionBase);
myChart.setOption(optionData);
myChart.setOption(optionMedia);
