/**
 * Created by Lunding on 16/07/15.
 */

var participants = 0;
var restaurant = -1;
var defaultMeal = -1;

$( document ).ready(function() {
    $(".date").datetimepicker();

    $('#participants')
        .on('tokenfield:createtoken', function (e) {
            var data = e.attrs.value.split('|');
            e.attrs.value = data[1] || data[0];
            e.attrs.label = data[1] ? data[0] + ' (' + data[1] + ')' : data[0];
        })
        .on('tokenfield:createdtoken', function (e) {
            // Über-simplistic e-mail validation
            var re = /\S+@\S+\.\S+/;
            var valid = re.test(e.attrs.value);
            if (!valid) {
                //$(e.relatedTarget).addClass('invalid');
                $(e.relatedTarget).remove();
                alert("invalid email");
            } else {
                participants++;
                updatePrice();
            }
        })
        .on('tokenfield:edittoken', function (e) {
            if (e.attrs.label !== e.attrs.value) {
                var label = e.attrs.label.split(' (');
                e.attrs.value = label[0] + '|' + e.attrs.value;
            }
        })
        .on('tokenfield:removedtoken', function (e) {
            //alert('Token removed! Token value was: ' + e.attrs.value);
            participants--;
            updatePrice();
        })
        .tokenfield();

    fileUpload();
    budgetHandler();
});

function updatePrice(){
    $("#numberparticipants").val(participants +"").change();
}

function resetParticipants(){
    $(".token").remove();
    participants = 0;
}

function formatDate(input){
    var date = new Date(input);
    var months = (date.getMonth()+1);
    var days = date.getDate();
    months = months < 10 ? "0" + months : months;
    days = days < 10 ? "0" + days : days;
    return months + "/" + days + "/" + date.getFullYear() + " " + formatAMPM(input);
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function fileUpload(){
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.

        function readBlob(files, opt_startByte, opt_stopByte) {
            if (!files.length) {
                alert('Please select a file!');
                return;
            }

            var file = files[0];
            var start = parseInt(opt_startByte) || 0;
            var stop = parseInt(opt_stopByte) || file.size - 1;

            var reader = new FileReader();

            // If we use onloadend, we need to check the readyState.
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    // document.getElementById('byte_content').textContent = evt.target.result;
                    parseICAL(evt.target.result);
                }
            };

            var blob = file.slice(start, stop + 1);
            reader.readAsBinaryString(blob);
        }

        function parseICAL(content){
            // Get the basic data out
            var jCalData = ICAL.parse(content);
            var comp = new ICAL.Component(jCalData[1]);

            // Fetch the VEVENT part
            var vevent = comp.getFirstSubcomponent('vevent');
            var event = new ICAL.Event(vevent);

            $('#title').val(event.summary + "");
            $('#description').text(event.description);
            $('#location').val(event.location + "");
            $('#timestart').val(formatDate(event.startDate.toJSDate()) +"");
            $("#timeend").val(formatDate(event.endDate.toJSDate()) +"");
            resetParticipants();
            var participants = $('#participants-tokenfield');
            participants.focus();
            for (var i = 0; i < event.attendees.length; i++) {
                var email = event.attendees[i].jCal[3].replace('mailto:','').replace('MAILTO:','');
                var re = /\S+@\S+\.\S+/;
                var valid = re.test(email);
                if (valid) {
                    participants.val(email + "");
                    participants.trigger(jQuery.Event('keypress', {which: 44}));
                }
            };
            $("#budget").focus();
            console.log(event);

            // Get start and end dates as local time on current machine
            // console.log(event.startDate.toJSDate(), event.endDate.toJSDate());
        }

        function handleFileDrop(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            var files = evt.dataTransfer.files; // FileList object.

            listFiles(files);
        }

        function handleFileSelect(evt) {
            var files = evt.target.files; // FileList object

            listFiles(files);
        }

        function listFiles(files){
            // files is a FileList of File objects. List some properties.
            var output = [];
            for (var i = 0, f; f = files[i]; i++) {
                output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                    f.size, ' bytes, last modified: ',
                    f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                    '</li>');
            }
            document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

            readBlob(files);
        }

        function handleDragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        }

        // Setup the dnd listeners.
        var dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileDrop, false);
        document.getElementById('upload_file').addEventListener('change', handleFileSelect, false);

        $('#upload').click(function(){
            $('#upload_file').click();
            return false;
        });

    } else {
        alert('The File APIs are not fully supported in this browser.');
    }
}

function submit() {
    var title = $("#title").val();
    var timeStart = $("#timestart").val();
    var timeEnd = $("#timeend").val();
    var description = $("#description").val();
    var location = $("#location").val();
    var participants = $("#participants").val();
    var prperson = $("#prperson").val();


    $("#restaurantInformation").hide(1000);
    scrollToTop();
    $("#successInformation").show(1000);

    //TODO: update function
    $.post("/", {
         title: title,
         start: timeStart,
         end: timeEnd,
         description: description,
         participants: participants,
         restaurant_id: restaurant,
         prperson: prperson,
         meal_id: defaultMeal

        }, function(data, status){
            // alert("Data: " + data + "\nStatus: " + status);
            console.log(data)
        }
    );
}

function chooserestaurant(){
    //TODO: input validation (http://stackoverflow.com/questions/18296267/form-validation-with-bootstrap-jquery)
    var title = $("#title");
    var timeStart = $("#timestart");
    var location = $("#location");
    var participants = $("#participants-tokenfield");
    var availablePrPerson = $("#prperson");
    var budget = $("#budget");

    $(".form-group").removeClass("has-error");

    if (!title.val()){
        title.closest('div[class^="form-group"]').addClass("has-error");
        title.focus();
        scrollToTop();
        return;
    }
    if (!timeStart.val()){
        timeStart.closest('div[class^="form-group"]').addClass("has-error");
        timeStart.focus();
        scrollToTop();
        return;
    }
    if (!location.val()){
        location.closest('div[class^="form-group"]').addClass("has-error");
        location.focus();
        scrollToTop();
        return;
    }
    if (this.participants < 1){
        participants.closest('div[class^="form-group"]').addClass("has-error");
        participants.focus();
        return;
    }
    if (!availablePrPerson.val() || availablePrPerson.val() <= 0){
        availablePrPerson.closest('div[class^="form-group"]').addClass("has-error");
        budget.closest('div[class^="form-group"]').addClass("has-error");
        budget.focus();
        return;
    }

    var container = $("#restaurants");
    container.empty();

    $.getJSON("/api/meals.json?prperson=" + (availablePrPerson.val() * 100) +"", function(result){
        console.log(result);
        for (var i = 0; i < result.length; i++){
            var restaurant = result[i]["restaurant"];
            var meals = result[i]["meals"];

            var priceLow = 9007199254740992;
            var priceHigh = -9007199254740992;
            for(var k = 0; k < meals.length; k++){
                priceLow = Math.min(priceLow, meals[k]["price"]);
                priceHigh = Math.max(priceHigh, meals[k]["price"]);
            }
            var rowDiv = $('<div class="row restaurant-group"></div>');
            rowDiv.append(generateRestaurantHtml(restaurant["title"],restaurant["description"], restaurant["image"], priceLow, priceHigh, restaurant["id"]));
            for(var j = 0; j < meals.length; j++){
                rowDiv.append(generateMealHtml(meals[j]["title"], meals[j]["description"], meals[j]["image"], meals[j]["price"], meals[j]["id"]));
            }
            container.append(rowDiv);
        }
        restaurantPicker();
    });

    $("#eventInformation").hide(1000);
    scrollToTop();
    $("#restaurantInformation").show(1000);
}

function generateRestaurantHtml(title, description, image, priceLow, priceHigh, id){
    title = title.toUpperCase();
    priceLow = (priceLow / 100) * participants;
    priceHigh = (priceHigh / 100) * participants;
    return '<div class="col-sm-4 col-lg-2 resta-card" id="' + id + '"><div class="thumbnail"> <img src="' + image + '"> <div class="post-content"> <div class="caption"> <p class="title-header">' + title +'</p> <p class="price-header">$' + priceLow + '-$' + priceHigh + '</p></div></div></div><div class="resta-description"><p>' + description + '</p> </div></div>';
}

function generateMealHtml(title, description, image, price, id){
    title = title.toUpperCase();
    price = price / 100;
    //return '<div class="col-sm-4 col-lg-2 hidden-xs meal-card"><div class="thumbnail"> <img src="img/' + image + '"> <div class="post-content"> <div class="caption"> <p class="title-header">' + title +'</p> <p class="price-header"><img src="img/icon_cow.png"><span style="margin-right: 10px"></span>$' + price + '</p> </div></div></div><div class="resta-description"> <p>' + description + '</p> </div></div>';
    return '<div class="col-sm-4 col-lg-2 hidden-xs meal-card" id="' + id + '"><div class="thumbnail"> <img src="img/burger.jpg"> <div class="post-content"> <div class="caption"> <p class="title-header">' + title +'</p> <p class="price-header"><img src="img/icon_cow.png"><span style="margin-right: 10px"></span>$' + price + '</p> </div></div></div><div class="resta-description"> <p>' + description + '</p> </div></div>';
}


function restaurantPicker(){
    $(".restaurant-group").click(function(){
        $(".restaurant-group").removeClass("picked-group");
        $(this).addClass("picked-group");
        restaurant = $(this).find(".resta-card").attr("id");
        defaultMeal = $(this).find(".meal-card:first").attr("id");
        $("#submitbutton").prop("disabled", false);
    });
}

function budgetHandler(){
    var budget = $("#budget");
    var prPerson = $("#prperson");
    budget.on('input keyup paste change', function(){
        prPerson.val((Math.round(budget.val() / participants * 100) / 100) +"" );
    });
    prPerson.on('input keyup paste change', function(){
       budget.val( (Math.round(prPerson.val() * participants * 100) / 100) + "");
    });
    $("#numberparticipants").on('change', function(){
        prPerson.val( (Math.round(budget.val() / participants * 100) / 100)+"" );
    });

}

function scrollToTop(){
    $("html, body").animate({ scrollTop: 0 }, "slow");
}