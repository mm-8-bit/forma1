
(function ($) {

    $(document).ready(function () { 
        var timer;
        $('#woocommerce-product-search-field').on('input', function() {
            var dt=$('.category-dropdown :selected').text();
            if(dt=='All Categories') {
                dt='';
            }
            var query = $(this).val();
            if (query.length >= 3) {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    $.ajax({
                        url: own_shope_obj.ajax_url,
                        method: 'POST',
                        data: {
                            action: 'search_products',
                            nonce: own_shope_obj.nonce,
                            query: query,
                            category: dt,
                        },
                        dataType: 'json',
                        beforeSend: function() {
                            $('.woocommerce-product-search__field').html('Searching...');
                        },
                        success: function(response) {
                            var $searchResultsPopup = $('.search-results-popup');
                            var $searchResultsList = $('.search-results-list');
                            $searchResultsPopup.hide();
                            var productPrice;
                            $('.woocommerce-product-search__field').html('');
                            if (response.length > 0) {
                                $('.search-results-list').html('');
                                $.each(response, function(index, product) {
                                    var productLink = '<a href="' + product.permalink + '">' + product.name + '&nbsp;</a>';
                                    var productImage = '<img src="' + product.image + '"/>';
                                    if(product.sale_price!='') {
                                        var productPrice = '<span class="price">| <strike>' + product.regular_price + '</strike> ' + product.sale_price + '</span>';
                                    }
                                    else {
                                        var productPrice = '<span class="price">| ' + product.regular_price + '</span>';
                                    }
                                    var listItem = '<li>' + productImage + productLink + productPrice + '</li>';
                                    $searchResultsList.append(listItem);
                                    
                                });
                                $searchResultsPopup.show();
                            } else {
                                $('.search-results-list').html('');
                                $('.woocommerce-product-search__field').html('');
                                var listItem = '<li>No Products found</li>';
                                $searchResultsList.append(listItem);
                                $searchResultsPopup.show();
                                }
                        },
                        error: function(xhr, status, error) {
                            var $searchResultsPopup = $('.search-results-popup');
                            var $searchResultsList = $('.search-results-list');
                            $('.search-results-list').html('');
                            $('.woocommerce-product-search__field').html('');
                            var listItem = '<li>No Products found</li>';
                            $searchResultsList.append(listItem);
                            $searchResultsPopup.show();
                        }
                    });
                }, 500);
            }
            else if (query.length == 0) { 
                var $searchResultsPopup = $('.search-results-popup');
                var $searchResultsList = $('.search-results-list');
                $('.search-results-list').html('');
                $('.woocommerce-product-search__field').html('');
            }
        });

        $(".category-dropdown").change(function() {
            var $searchResultsPopup = $('.search-results-popup');
            var $searchResultsList = $('.search-results-list');
            $('.search-results-list').html('');
            $('.woocommerce-product-search__field').html('');
        });

    });
})(this.jQuery);