$(function(){

	$.fn.staggeredslider = function(settings) {

		// default global vars
		var config = {
			hoverPause : true,
			stagger : 100,
			pageSpeed : 8000,
			autoPlay : true,
			activeClass : 'active',
			fadeOut : 'fast',
			hoverOnPause : true,
			pauseOnHoverArea : $(this).parent(),
			controlsArea : $(this).parent(), // TODO: sort out jquery-ification of custom property
			animateFrom : {
				"opacity" : 1
			},
			animateTo : {
				"opacity" : 1
			},
			extraAnimateFrom : {
				"opacity" : 0
			},
			extraAnimateTo : {
				"opacity" : 1
			}
		};

		// merge default global variables with custom variables, modifying 'config'
		if (settings) $.extend(true, config, settings);

		var base = this,
			pages = $(base).children(),
			currentIndex = 0,
			autoPlay = config.autoPlay,
			transitionInProgress = false,
			intervalId = setInterval(cyclePages, config.pageSpeed);

		init();

		function init() {
			$(base).find('div:not(.active)').hide();

			var parent = $(base).parent();

			config.controlsArea.append('<div class="ss-controls"><button class="ss-prev">Previous</button> <span class="ss-pagination"><span class="ss-current">1</span>/<span class="ss-total"></span></span> <button class="ss-next">Next</button></div>');
			config.controlsArea.find('.ss-controls .ss-total').text(pages.length);

			if (config.autoPlay && config.hoverOnPause) {
				config.pauseOnHoverArea.mouseover(function () {
					autoPlay = false;
				});

				// TODO: mouseout on children trigger this then an immediate mouseover.
				config.pauseOnHoverArea.mouseout(function (event) {
					// event.stopPropagation(); // Something like this
					autoPlay = true;
				});
			}
		}

		function next() {
			changePage(1);
		}

		function previous() {
			changePage(-1);
		}

		function cyclePages() {
			if (autoPlay) {
				next();
			}
		}

		function changePage(numberOfPages) {
			if (!transitionInProgress) {
				hidePages();
				stepPages(numberOfPages);
			}
		}

		function stepPages(numberOfPages) {

			currentIndex += numberOfPages;

			if (currentIndex >= pages.length) {
				currentIndex = 0;
			} else if (currentIndex < 0) {
				currentIndex = pages.length-1;
			}

			if (numberOfPages > 0) {
				$(pages[currentIndex]).addClass('animate-left');
			} else {
				$(pages[currentIndex]).addClass('animate-right');
			}

			displayPage(pages[currentIndex]);
		}

		function hidePages() {
			$(pages).fadeOut(config.fadeOut).removeClass(config.activeClass);
		}

		function displayPage(page) {

			transitionInProgress = true;

			$(page).addClass(config.activeClass);

			$(page).css({
				'position' : 'absolute',
				'top' : '0',
				'left' : '0'
			});

			$(page).show();

			//update page number
			config.controlsArea.find('.ss-controls .ss-current').text(currentIndex + 1);

			animateChildren(pages[currentIndex]);
		}

		function prepareChildren(children, container) {

			var marginWhenHidden = $(container).outerWidth() * 1.5;

			children.each(function() {


				if ($(this).hasClass('exclude')) {
					$(this).css(config.extraAnimateFrom);
				} else {

					// Setting dynamic property to maintain child margins.
					this['originalMargin'] = $(this).css('margin-left');

					if ($(this).parent().hasClass('animate-left')) {
						$(this).css({'margin-left' : marginWhenHidden + 'px'});
					} else {
						$(this).css({'margin-left' : '-' + marginWhenHidden + 'px'});
					}

					$(this).css(config.animateFrom);
				}
			});
		}

		function animateChildren(container) {

			var children = $(container).children(),
				childIndex = 0,
				widths = [];

			prepareChildren(children, container);

			var loopId = setInterval(function() {

				var child = children[childIndex],
					animateTo = 0,
					animationProperties = {
					'margin-left': child.originalMargin
				};

				if ($(child).hasClass('exclude')) {
					$(child).animate(config.extraAnimateTo, "out");
				} else {
					$.extend(true, config.animateTo, animationProperties);
					$(child).animate(config.animateTo, "out");
				}

				if (children.length - 1 === childIndex) {
					clearTimeout(loopId);
					transitionInProgress = false;
					$(container).removeClass('animate-left');
					$(container).removeClass('animate-right');
				}

				childIndex += 1;
			}, config.stagger);
		}

		// next button
		config.controlsArea.find('.ss-next').on('click', function() {
			next();
		});
		// prev button
		config.controlsArea.find('.ss-prev').on('click', function() {
			previous();
		});
	};
}(jQuery));
