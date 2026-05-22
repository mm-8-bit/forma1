/**
 * Own Shop Quick View JavaScript
 */

jQuery(document).ready(function($) {

    // Quick View Button Click
    $(document).on('click', '.own-shop-quick-view-btn', function(e) {
        e.preventDefault();

        var button = $(this);
        var product_id = button.data('product-id');
        var product_type = button.data('product-type');

        if (!product_id) {
            return;
        }

        // Add loading state
        button.addClass('loading');

        // AJAX request
        $.ajax({
            type: 'POST',
            url: own_shop_quick_view_ajax.ajax_url,
            data: {
                action: 'own_shop_quick_view',
                product_id: product_id,
                product_type: product_type,
                nonce: own_shop_quick_view_ajax.nonce
            },
            success: function(response) {
                button.removeClass('loading');

                if (response.success) {
                    // Remove any existing quick view modal first
                    $('.own-shop-quick-view-modal').remove();

                    // Append new modal to body and show it
                    $('body').append(response.data);
                    document.body.style.overflow = 'hidden';

                    // Show modal with animation
                    var modal = document.querySelector('.own-shop-quick-view-modal');
                    if (modal) {
                        modal.classList.add('active');
                    }

                    initQuickViewModal();
                } else {
                    alert('Error: ' + response.data);
                }
            },
            error: function(xhr, status, error) {
                button.removeClass('loading');
                console.log('AJAX Error:', error);
                alert('Error loading quick view. Please try again.');
            }
        });
    });

    // Initialize Modal Functionality
    function initQuickViewModal() {

        // Close Modal on overlay click (clicking outside the content)
        $(document).on('click', '.own-shop-quick-view-modal.active', function(e) {
            if (e.target === this) {
                closeOwnShopQuickView();
            }
        });

        // Close Modal on close button click
        $('.quick-view-close').on('click', function(e) {
            e.preventDefault();
            closeOwnShopQuickView();
        });

        // Close on ESC key
        $(document).on('keyup.quickview', function(e) {
            if (e.keyCode === 27) { // ESC
                closeOwnShopQuickView();
            }
        });

        // Handle WooCommerce variations if present
        initVariations();
    }

    // Legacy close function (keeping for compatibility)
    function closeQuickViewModal() {
        closeOwnShopQuickView();
    }

    // Initialize Variations (for variable products)
    function initVariations() {
        if (typeof wc_add_to_cart_variation_params !== 'undefined') {
            $('.variations_form').each(function() {
                $(this).wc_variation_form();
            });
        }

        // Handle variation selection
        $('.quick-view-details').on('change', '.variations select', function() {
            var $form = $(this).closest('.variations_form');
            var $button = $form.find('.single_add_to_cart_button');
            var $variationWrap = $form.find('.single_variation_wrap');

            // Show/hide variation details and update button
            if ($(this).val()) {
                checkVariations($form);
            }
        });

        // Check if all variations are selected
        function checkVariations($form) {
            var $button = $form.find('.single_add_to_cart_button');
            var allSelected = true;

            $form.find('.variations select').each(function() {
                if ($(this).val() === '') {
                    allSelected = false;
                    return false;
                }
            });

            if (allSelected) {
                var variationData = $form.data('product_variations');
                var selectedAttributes = {};

                $form.find('.variations select').each(function() {
                    var attributeName = $(this).data('attribute_name');
                    selectedAttributes[attributeName] = $(this).val();
                });

                // Find matching variation
                var matchingVariation = findMatchingVariation(variationData, selectedAttributes);

                if (matchingVariation) {
                    updateVariationInfo($form, matchingVariation);
                    $button.removeClass('disabled').prop('disabled', false);
                } else {
                    $button.addClass('disabled').prop('disabled', true);
                }
            } else {
                $button.addClass('disabled').prop('disabled', true);
            }
        }

        function findMatchingVariation(variations, selectedAttributes) {
            for (var i = 0; i < variations.length; i++) {
                var variation = variations[i];
                var matches = true;

                for (var attr in selectedAttributes) {
                    if (selectedAttributes.hasOwnProperty(attr)) {
                        if (variation.attributes[attr] !== selectedAttributes[attr] && variation.attributes[attr] !== '') {
                            matches = false;
                            break;
                        }
                    }
                }

                if (matches) {
                    return variation;
                }
            }
            return null;
        }

        function updateVariationInfo($form, variation) {
            var $wrap = $form.find('.single_variation_wrap');
            var $variationPrice = $wrap.find('.woocommerce-variation-price');
            var $variationId = $wrap.find('.variation_id');
            var $variationDescription = $wrap.find('.woocommerce-variation-description');

            // Update price
            if (variation.price_html) {
                $('.quick-view-price').html(variation.price_html);
            }

            // Update variation ID
            $variationId.val(variation.variation_id);

            // Update description
            if (variation.variation_description) {
                $variationDescription.html(variation.variation_description).show();
            } else {
                $variationDescription.hide();
            }

            // Update availability
            if (variation.is_in_stock) {
                $wrap.find('.woocommerce-variation-availability').html('<p class="stock in-stock">' + variation.availability_html + '</p>');
            } else {
                $wrap.find('.woocommerce-variation-availability').html('<p class="stock out-of-stock">' + variation.availability_html + '</p>');
            }
        }
    }


    // Quantity Controls for Quick View
    window.decreaseQuickViewQuantity = function() {
        var input = document.getElementById('quick-view-quantity');
        if (input && parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    }

    window.increaseQuickViewQuantity = function() {
        var input = document.getElementById('quick-view-quantity');
        input.value = parseInt(input.value) + 1;
    }

    // Change Main Image
    window.changeQuickViewImage = function(src, thumbnail) {
        var mainImage = document.getElementById('quick-view-main-image');
        if (mainImage) {
            mainImage.src = src;
        }

        // Update active thumbnail
        var thumbnails = document.querySelectorAll('.quick-view-thumbnails .thumbnail');
        thumbnails.forEach(function(thumb) {
            thumb.classList.remove('active');
        });
        thumbnail.classList.add('active');
    }

    // Add to Cart from Quick View
    window.addQuickViewToCart = function(productId) {
        var quantity = document.getElementById('quick-view-quantity').value || 1;
        var button = event.target;

        if (button.classList.contains('loading')) {
            return;
        }

        button.classList.add('loading');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        $.ajax({
            type: 'POST',
            url: own_shop_quick_view_ajax.ajax_url,
            data: {
                action: 'own_shop_quick_view_add_to_cart',
                product_id: productId,
                quantity: quantity,
                security: own_shop_quick_view_ajax.nonce
            },
            success: function(response) {
                button.classList.remove('loading');
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';

                if (response.error) {
                    alert(response.error);
                } else {
                    // Update cart fragments
                    if (typeof wc_cart_fragments_params !== 'undefined') {
                        $(document.body).trigger('wc_fragment_refresh');
                    }

                    closeOwnShopQuickView();
                    alert('Product added to cart successfully!');
                }
            },
            error: function(xhr, status, error) {
                button.classList.remove('loading');
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                console.log('Add to cart error:', error);
                alert('Error adding to cart. Please try again.');
            }
        });
    }

    // Close Modal Function
    window.closeOwnShopQuickView = function() {
        var modal = document.querySelector('.own-shop-quick-view-modal');
        if (modal) {
            modal.classList.remove('active');
            // Remove modal from DOM after animation completes
            setTimeout(function() {
                modal.remove();
            }, 300); // Match transition duration
        }
        document.body.style.overflow = 'auto';
    }

    // Handle Add to Cart in Modal
    $(document).on('submit', '.quick-view-details form.cart', function(e) {
        e.preventDefault();

        var form = $(this);
        var button = form.find('.single_add_to_cart_button');

        if (button.hasClass('loading')) {
            return;
        }

        button.addClass('loading');

        var formData = new FormData(form[0]);


        // Use WooCommerce add to cart action
        var data = $(form).serialize();
        data += '&action=woocommerce_add_to_cart';

        $.ajax({
            type: 'POST',
            url: own_shop_quick_view_ajax.ajax_url,
            data: data,
            success: function(response) {
                button.removeClass('loading');

                if (response.error) {
                    alert(response.error);
                } else {
                    // Update cart fragments
                    if (typeof wc_cart_fragments_params !== 'undefined') {
                        $(document.body).trigger('wc_fragment_refresh');
                    }

                    closeOwnShopQuickView();

                    // Optional: Show success message
                    if (response.success_message) {
                        // You could show a toast or update the cart count
                        console.log(response.success_message);
                    }
                }
            },
            error: function(xhr, status, error) {
                button.removeClass('loading');
                console.log('Add to cart error:', error);
                alert('Error adding to cart. Please try again.');
            }
        });
    });
});
