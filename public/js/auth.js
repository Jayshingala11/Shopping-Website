$(document).ready(function () {
    $("#signupForm").submit(function (event) {
        event.preventDefault();

        const name = $("#signupForm input[name=username]").val();
        const email = $("#signupForm input[name=email]").val();
        const password = $("#signupForm input[name=password]").val();
        const confirmPassword = $("#signupForm input[name=confirmPassword]").val();

        $.ajax({
            url: "/auth/postSignup",
            type: "POST",
            data: {
                name,
                email,
                password,
                confirmPassword,
            },
            success: function (response) {
                if (response.success) {
                    alert(response.msg);
                    window.location.href = "/auth/login";
                } else {
                    alert(response.error);
                }
            },
        });
    })
})


$(document).ready(function () {
  $(".loginForm").submit(function (event) {
    event.preventDefault();

    const email = $(".loginForm input[name=email]").val();
    const password = $(".loginForm input[name=password]").val();

    $.ajax({
      url: "/auth/postLogin",
      type: "POST",
      data: {
        email,
        password,
      },
      success: function (response) {
        if (response.success) {
            const userId = response.data;
            window.location.href = `/admin-products?userId=${userId}`;
        } else {
            alert(response.error);
        }
      },
    });
  });
});
