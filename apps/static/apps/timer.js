(function( $ ){

  $.fn.timer = function( options ) {  

	var now = new Date();
    var settings = $.extend( {
		utc : (-now.getTimezoneOffset())/60,
		language : 'ru',		
		format_in : '%d.%M.%y %h:%m:%s',
		format_out : '%d %h %m %s',
		end_message : "00:00:00",
		wrapChar: false,
		onEnd : function () {},
		change : true,
		update_time : 1000,
        onTimeChange: function() {}
    }, options);



    return this.each(function() {        
		var obj = $(this);

		var short = $.trim(obj.text());

		var interval;
		var lang = {
				days : ['день','дня','дней'],
				hours : ['час','часа','часов'],
				minuts : ['минута','минуты','минут'],
				seconds : ['секунда','секунды','секунд']
		};

		if (settings.language=='en') {
			lang = {
				days : ['day','days','days'],
				hours : ['hour','hours','hours'],
				minuts : ['minut','minuts','minuts'],
				seconds : ['second','seconds','seconds']
			};
		}
		var time_output = settings.end_message;

		var inner = short.replace(/[^0-9]/g," ").split(' ');

		var inner_format = settings['format_in'].replace(/[^%dMyhms]/g," ").split(' ');
		var inner_array = [];
		for (var i = 0; i < inner_format.length; i++) {
			inner_array[inner_format[i]] = inner[i];
		}
		if (!inner_array['%y']) {
			if(now > new Date(now.getFullYear(), inner_array['%M']-1, inner_array['%d'], inner_array['%h'],inner_array['%m'],inner_array['%s'])){
				inner_array['%y'] = now.getFullYear() + 1;
			}
		}
		var date_to = new Date(inner_array['%y'], (inner_array['%M']-1>=0?inner_array['%M']-1:now.getMonth()), inner_array['%d']||now.getDate()+1, inner_array['%h']||0, inner_array['%m']||0, inner_array['%s']||0);



		function modifier_spellcount(num) {
			var num_null = num<10?'0':'';
			if (settings.wrapChar) {
				var num = (num_null + num).toString().split('');
				var res = '';

				for (i = 0; i < num.length; i++) {
					res += '<' + settings.wrapChar + '>' + num[i] + '</' + settings.wrapChar + '>';
				}

				return res;
			}
			return num_null + num;
		}

		function declension(number, one, two, five) {
			number = Math.abs(number);
		    number %= 100;
		    if (number >= 5 && number <= 20) {
		        return five;
		    }
		    number %= 10;
		    if (number == 1) {
		        return one;
		    }
		    if (number >= 2 && number <= 4) {
		        return two;
		    }
		    return five;
		}

		function set_time() {
			now = new Date();
			var time_intervar = date_to - now - ((-now.getTimezoneOffset()*60000) - (settings.utc*3600*1000));
			var days = Math.floor(time_intervar/3600/1000/24);
			var hours = Math.floor(time_intervar/3600/1000) - Math.floor(time_intervar/3600/1000/24)*24;
			var minuts = Math.floor(time_intervar/60/1000) - Math.floor(time_intervar/3600/1000)*60;
			var seconds = Math.floor(time_intervar/1000) - Math.floor(time_intervar/60/1000)*60;
			var daysName, hoursName, minutesName, secondsName;

			if (time_intervar>0) {
				
				daysName = declension(days, lang.days[0], lang.days[1], lang.days[2]);
				hoursName = declension(hours, lang.hours[0], lang.hours[1], lang.hours[2]);
				minutesName = declension(minuts, lang.minuts[0], lang.minuts[1], lang.minuts[2]);
				secondsName = declension(seconds, lang.seconds[0], lang.seconds[1], lang.seconds[2]);
				days = modifier_spellcount(days);
				hours = modifier_spellcount(hours);
				minuts = modifier_spellcount(minuts);
				seconds = modifier_spellcount(seconds);

				time_output = settings['format_out']
					.replace('%d', days)
					.replace('%h', hours)
					.replace('%m', minuts)
					.replace('%s', seconds)
					.replace(timerDays, daysName)
					.replace(timerHours, hoursName)
					.replace(timerMinutes, minutesName)
					.replace(timerSeconds, secondsName);
				obj.html(time_output);
				settings.onTimeChange.call(obj);
			}else{
				obj.html(settings.end_message);
				settings.onEnd.call(obj);
				clearInterval(interval);
			}
		}
		set_time();
		if (settings.change) interval = window.setInterval(set_time,settings.update_time);
    });
  };
})( jQuery );