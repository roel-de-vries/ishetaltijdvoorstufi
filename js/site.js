// A stufi-transaction will be made on the 24th, unless that date falls in the weekend which in that case the transaction will be made on the Friday before.
// 24 December is also skipped: if it falls on Monday or the weekend the transaction will be made on the Friday before. Otherwise the day before the 24th.

var date = new Date(),
daysTillStufi = 0,
isItToidElement = document.getElementById('isItToid'),
moreInfoElement = document.getElementById('moreInfo'),
stufiDate = GetStufiDate();

// Check if it's already stufi time
if(date.getDate() === stufiDate.getDate()) {
    isItToidElement.innerHTML = 'Ja!';
    isItToidElement.style.color = '#2ecc71';
    moreInfoElement.innerHTML = 'Dank u ome Duo!'
}
else {
    // Check if we've surpassed this months stufi date
    if(date.getDate() > stufiDate.getDate()) {
        stufiDate = GetStufiDate(1);
    }

    daysTillStufi = CalculateDaysDifference(date, stufiDate);

    isItToidElement.innerHTML = 'Nee!';
    isItToidElement.style.color = '#e74c3c';

    switch (daysTillStufi) {
        case 0:
            moreInfoElement.innerHTML = 'Nog een paar uur te gaan tot de ' + stufiDate.getDate() + 'e , hou vol!';
            break;
        case 1:
            moreInfoElement.innerHTML = 'Nog één dag te gaan tot de ' + stufiDate.getDate() + 'e, hou vol!';
            break;
        default:
            moreInfoElement.innerHTML = 'Nog ' + daysTillStufi + ' dagen te gaan tot de ' + stufiDate.getDate() + 'e, hou vol!';
            break;
    }
}

function GetStufiDate(monthOffset = 0) {
    var countDownDay = 24,
        dateHelper = new Date(date.getFullYear(), date.getMonth(), countDownDay);

    // Check if a date with a month offset needs to be calculated
    if(monthOffset) {
        dateHelper.setMonth(dateHelper.getMonth() + 1);
    }

    var dayOfWeek = dateHelper.getDay(),
    month = dateHelper.getMonth();

    // Check if 24th falls:
    // on a Sunday
    if(dayOfWeek === 0) {
        countDownDay = 22;
    }
    // on a Saturday
    else if(dayOfWeek === 6) {
        countDownDay = 23
    }
    // in December
    else if(month === 11) {
        // on a Monday
        if(dayOfWeek === 1) {
            countDownDay = 21;
        }
        else {
            countDownDay = 23;
        }
    }

    return new Date(dateHelper.getFullYear(), dateHelper.getMonth(), countDownDay);
}

function CalculateDaysDifference(dateOne, dateTwo) {
    var oneDay = 24*60*60*1000;
    return Math.round(Math.abs(dateOne.getTime() - dateTwo.getTime()) / (oneDay));
}