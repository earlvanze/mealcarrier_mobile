(function () {

    'use strict';

    angular
        .module('mealcarrier.formValidateAfter', ['ionic'])
        .directive('formValidateAfter', formValidateAfter);

    function formValidateAfter() {
        var directive = {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            var validateClass = 'form-validate';
            ctrl.validate = false;
            element.bind('focus', function (evt) {
                if (ctrl.validate && ctrl.$invalid) // if we focus and the field was invalid, keep the validation
                {
                    element.addClass(validateClass);
                    scope.$apply(function () { ctrl.validate = true; });
                }
                else {
                    element.removeClass(validateClass);
                    scope.$apply(function () { ctrl.validate = false; });
                }

            }).bind('blur', function (evt) {
                element.addClass(validateClass);
                scope.$apply(function () { ctrl.validate = true; });
            });
        }
    }

}());