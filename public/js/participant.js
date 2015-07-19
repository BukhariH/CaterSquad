/**
 * Created by Lunding on 16/07/15.
 */

var meal = 1;


function loadImages(){
    $.get( "some.url", function( data ) {
        $( ".result" ).html( data );
    });
}

function submit() {
    $.post("some url",
        {
            email: "Donald Duck",
            city: "Duckburg"
        },
        function(data, status){
            alert("Data: " + data + "\nStatus: " + status);
        }
    );
}

$( document ).ready(function() {
    //loadImages();

    $(".MyImg").click(function(){
        $("div").removeClass("selected-img");
        meal = $(this).find("img").attr("id");
        $(this).addClass("selected-img");
    });
});