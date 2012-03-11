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
			controlsType : "next/prev",
			animateFirstPageIn : false,
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
			currentPageIndex = 0,
			autoPlay = config.autoPlay,
			transitionInProgress = false,
			intervalId = setInterval(next, config.pageSpeed);

		init();

		function init() {

			prepairFirstPage();
			setupControls();

			if (config.autoPlay && config.hoverOnPause) {
				config.pauseOnHoverArea.mouseover(function () {
					clearTimeout(intervalId);
				});

				// TODO: mouseout on children trigger this then an immediate mouseover.
				config.pauseOnHoverArea.mouseout(function (event) {
					// event.stopPropagation(); // Something like this
					intervalId = setInterval(next, config.pageSpeed);
				});
			}
		}

		function next() {
			changePage(1);
		}

		function previous() {
			changePage(-1);
		}

		function changePage(numberOfPages) {
			if (!transitionInProgress) {
				hidePages();
				stepPages(numberOfPages);
			}
		}

		function jumpToPage(toPageIndex) {

			if (toPageIndex === currentPageIndex) {
				// Prevent navigating to the current page.
			} else {
				changePage(toPageIndex - currentPageIndex);
			}
		}

		function stepPages(numberOfPages) {

			currentPageIndex += numberOfPages;

			// Wrapping
			if (currentPageIndex >= pages.length) {
				currentPageIndex = 0;
			} else if (currentPageIndex < 0) {
				currentPageIndex = pages.length-1;
			}

			if (numberOfPages > 0) {
				$(pages[currentPageIndex]).addClass('animate-left');
			} else {
				$(pages[currentPageIndex]).addClass('animate-right');
			}

			displayPage(pages[currentPageIndex]);
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

			// Update page number or active navigation item.
			config.controlsArea.find('.ss-controls .ss-current').text(currentPageIndex + 1);
			$(base).find('.ss-pages li').removeClass('active');
			$($(base).find('.ss-pages li')[currentPageIndex]).addClass('active');

			animateChildren(pages[currentPageIndex]);
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
					$(child).delay(250).animate(config.extraAnimateTo, "out");
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

		function prepairFirstPage() {
			if (config.animateFirstPageIn) {
				$(pages).hide();
				currentPageIndex = -1;
				stepPages(1);
			} else {
				$(pages[0]).parent().children(':not(:first-child)').hide();
			}
		}

		function setupControls() {
			switch (config.controlsType) {
				case 'next/prev':
					setupNextPrevControls();
					break;
				case 'itimised':
					setupItemisedControls();
				break;
				case 'none':
				default:
					// No controls.
				break;
			}

			function setupItemisedControls() {
					config.controlsArea.append('<div class="ss-controls"><ol class="ss-pages"></ol></div>');

					$(pages).each(function(index) {
						$(".ss-pages").append('<li data-page-number="' + index +'" class="paginate' + (index + 1)  +'">'+ (index + 1) +'</li>');
					});

					config.controlsArea.find('.ss-pages li').on('click', function() {
						jumpToPage($(this).data('page-number'));
					});

					$($(base).find('.ss-pages li')[0]).addClass("active");
			}

			function setupNextPrevControls() {
				config.controlsArea.append('<div class="ss-controls"><button class="ss-prev">Previous</button> <span class="ss-pagination"><span class="ss-current">1</span>/<span class="ss-total"></span></span> <button class="ss-next">Next</button></div>');
				config.controlsArea.find('.ss-controls .ss-total').text(pages.length);

				// next button
				config.controlsArea.find('.ss-next').on('click', function() {
					next();
				});

				// prev button
				config.controlsArea.find('.ss-prev').on('click', function() {
					previous();
				});
			}

		}
	};
}(jQuery));