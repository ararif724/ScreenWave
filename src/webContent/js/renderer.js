$(function () {
    $(".close-app").click(function () {
        app.close();
    });

    $(".recording-mode-select").click(function () {
        $(".recording-mode-select").removeClass('active');
        $(this).addClass('active');
        app.setRecordingMode($(this).data('recording-mode'));
    });
});