'use strict';

bindImagesLoad();

var $container = $('.container');

$container
    //toggle mobile menu
    .on('click', '.mobile-menu__handle', function(){
        $('.mobile-menu').toggleClass('mobile-menu--active');
    });

//lazy load plugin init
echo.init({
    offset: 500,
    throttle: 250,
    unload: false,
    callback: function (element, op) {
        $(element).addClass('echo-loaded');
    }
});

//main slider
(function(){

    if (window.mainSliderData != undefined) {

        var $mainSlider = $('.main-slider'),
            imageGroupName = 'big';

        if (window.matchMedia('(max-width: 768px)').matches) {
            imageGroupName = 'small';
        } else if (window.matchMedia('(max-width: 992px)').matches) {
            imageGroupName = 'normal';
        }

        mainSliderData[imageGroupName].forEach(function (item, i, src) {
            $mainSlider.find('.main-slider__item').eq(i)
                .find('img').attr('data-src', src[i]);
        });

        new Swiper('.main-slider__container', {
            speed: 600,
            lazyLoading: true,
            preloadImages: false,
            pagination: '.main-slider__pager',
            nextButton: '.main-slider__nbtn-next',
            prevButton: '.main-slider__nbtn-prev',
            paginationClickable: true,
            autoplay: 6000,
            onLazyImageReady: function (swiper, slide, image) {

                var $slide = $('.main-slider__item').eq(swiper.activeIndex),
                    imageSrc = $slide.find('img').attr('src');

                $slide
                    .find('.main-slider__content')
                    .css('background-image', 'url(' + imageSrc + ')')
                    .addClass('main-slider__content--ready');

            }
        });
    }

})();

//products' slider
(function(){

    $('.slider').each(function(){
        new Swiper('#' + $(this).find('.slider__container').attr('id'), {
            lazyLoading: true,
            slidesPerView: 4,
            spaceBetween: 30,
            autoHeight: true,
            nextButton: '.slider__arrow--next',
            prevButton: '.slider__arrow--prev',
            pagination: '.slider__pager',
            paginationClickable: true,
            breakpoints: {
                768: {
                    slidesPerView: 3,
                    spaceBetween: 20
                },
                480: {
                    slidesPerView: 2,
                    spaceBetween: 10
                }
            }
        });
    });

})();

//mobile catalog filter
$container.on('click', '.modal-filter__expand', function(){
    $(this)
        .toggleClass('is-active')
        .parent()
        .find('.modal-filter__list')
        .slideToggle(300);
});

//show images after page load
function bindImagesLoad() {
    $('.image-load:not(.loaded)').each(function(){
        var $self = $(this);
        $self.imagesLoaded(function(){
            $self.addClass('loaded');
        });
    });
}