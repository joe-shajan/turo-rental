
$('#owl-popular-cars').owlCarousel({
    loop: true,
    margin: 50,
    autoplay:true,
    dots:false,
    autoplayTimeout:10000,
    navText: ["<div class='nav-button owl-prev'>‹</div>", "<div class='nav-button owl-next'>›</div>"],

    nav: true,
    responsive: {
        0: {
            items: 1
        },
        600: {
            items: 2
        },
        1000: {
            items: 3
        }
    }
})

$('#brands').owlCarousel({
    loop: true,
    margin: 100,
    autoplay:true,
    dots:false,
    autoplayTimeout:10000,
    navText: ["<div class='nav-button owl-prev'>‹</div>", "<div class='nav-button owl-next'>›</div>"],

    nav: true,
    responsive: {
        0: {
            items: 2
        },
        600: {
            items: 3
        },
        1000: {
            items: 5
        }
    }
})

$('#city').owlCarousel({
    loop: true,
    margin: 50,
    autoplay:true,
    dots:false,
    autoplayTimeout:10000,
    navText: ["<div class='nav-button owl-prev'>‹</div>", "<div class='nav-button owl-next'>›</div>"],

    nav: true,
    responsive: {
        0: {
            items: 2
        },
        600: {
            items: 3
        },
        1000: {
            items: 5
        }
    }
})



