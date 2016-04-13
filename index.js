/**
 * Created by ketanbhatt on 13/04/16.
 */

$().ready(function () {
    $( "#usernameForm" ).submit(function( event ) {
        event.preventDefault();
        var username = $('#inputUserName').val();

        //Set username on the navbar and hide form
        $("#nav-username").text(username);
        $("#usernameForm").hide();
    });
});

