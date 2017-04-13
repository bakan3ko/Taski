//Device Ready function
$(function() {

    idCount = localStorage.getItem('idCount');
    dayCount = localStorage.getItem('dayCount');
    date = new Date();
    day = date.getDate();
    wasLogged = [];
    countDownH = [];
    countDownM = [];
    countDownS = [];

    if (idCount === null) {
        localStorage.setItem('idCount', 0);
        idCount = localStorage.getItem('idCount');
    }

    if (dayCount === null) {
        localStorage.setItem('dayCount', date.getDate());
        dayCount = localStorage.getItem('dayCount');
    }

    // localStorage.clear();

    displayAllTasks();
    displayAllLogs();

    fieldTimeOptions(24, '.addHours');
    fieldTimeOptions(60, '.addMin');

    setInterval(taskInterval, 1000);

    setTimeout(function(){
      // $('.splashScreen').animate({opacity: 0}, {duration: 300, complete: function(){
      //   $('.splashScreen').css('top', '-100%');
      // }});

      $('.splashScreen').css('opacity', '0');
      $('.splashScreen').css('top', '-100%');

    }, 3000)

    function taskInterval() {
        $('.taskItem').each(function() {
            itemId = $(this).attr('id');
            task = getTaskById(itemId);
            taskTime = pad(get24Hr(task.startHour + ":" + task.startMin + " " + task.amPm), 4);
            minToAdd = parseInt((task.hours * 60)) + parseInt(task.min);
            thisTime = pad(get24Hr(getval()), 4);
            addedTime = addTime(chunk(taskTime.toString(), 2).join(':'), minToAdd);

            if ((thisTime >= addedTime)) {
                $("div#" + itemId + " > .dot").removeClass("queue inprogress").addClass("completed");
                $("div#" + itemId).appendTo(".third");
                if (wasLogged[itemId] == 1) {
                    totalTime = localStorage.getItem('totalTime'+itemId);
                    localStorage.setItem('totalTime'+itemId, totalTime + minToAdd);
                    updateLog(itemId);
                    wasLogged[itemId] = 0;
                }
            } else if (thisTime < taskTime) {
                $("div#" + itemId + " > .dot").removeClass("completed inprogress").addClass("queue");
                $("div#" + itemId).insertBefore(".third:first-of-type");
                $("div#" + itemId).appendTo(".second");
            } else if ((thisTime >= taskTime) && (thisTime <= addedTime)) {
                $("div#" + itemId + " > .dot").removeClass("completed queue").addClass("inprogress");
                $("div#" + itemId).appendTo(".first");
                countDown(itemId);
                wasLogged[itemId] = 1;
            }

        })
    }

    $('.tab.tasks').click(function() {
        tabSelection('.tasks');
        hideAllSectionsExcept('#tasks');
    });

    $('.tab.schedule').click(function() {
        tabSelection('.schedule');
        hideAllSectionsExcept('#schedule');
    });

    $('.tab.logs').click(function() {
        tabSelection('.logs');
        hideAllSectionsExcept('#logs');
    });

    $('.addBtn').click(function() {
        hideAllSectionsExcept('#add');
    });

    $('.cancelBtn').click(function() {
        resetValues();
        tabSelection('.schedule');
        hideAllSectionsExcept('#schedule');
    });

    $('.addTask').click(function() {
        addTask();
    });

    $(document).on('click', ".taskItem", function() {
      $( this ).toggleClass( "showDelete" );
    });

    $('.deleteTask').click(function(){
      deleteTask($(this).attr('id'));
    });

    function deleteTask(id){
      localStorage.removeItem(id);
      $("#"+id).remove();
      $("#"+id+'.taskLog').remove();
    }

    function countDown(id) {

        if (countDownS[id] != 0) {
            countDownS[id]--;
        } else if (countDownM[id] != 0) {
            countDownM[id]--;
            countDownS[id] = 59;
        } else if (countDownH[id] != 0) {
            countDownH[id]--;
            if (countDownH[id] == 0) {
                countDownM[id] = 59;
            }
        }

        $('span.' + id).html(pad(countDownH[id], 2) + ":" + pad(countDownM[id], 2) + ":" + pad(countDownS[id], 2));
    }

    function chunk(str, n) {
        var ret = [];
        var i;
        var len;

        for (i = 0, len = str.length; i < len; i += n) {
            ret.push(str.substr(i, n))
        }

        return ret
    };

    function checkTime(time) {
        if (get24Hr(getval()) == get24Hr(time)) {
            console.log('ok');
        }
    }

    function addTime(time, minsAdd) {
        function z(n) {
            return (n < 10 ? '0' : '') + n;
        };
        bits = time.split(':');
        mins = bits[0] * 60 + +bits[1] + +minsAdd;
        return z(mins % (24 * 60) / 60 | 0) + z(mins % 60);
    }

    function get24Hr(time) {
        var hours = Number(time.match(/^(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "PM" && hours < 12) hours = hours + 12;
        if (AMPM == "AM" && hours == 12) hours = hours - 12;

        var minutes = Number(time.match(/:(\d+)/)[1]);
        hours = hours * 100 + minutes;
        return hours;
    }

    function getval() {
        var currentTime = new Date()
        var hours = currentTime.getHours()
        var minutes = currentTime.getMinutes()

        if (minutes < 10) minutes = "0" + minutes;

        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }
        if (hours == 0) {
            hours = 12;
        }
        var current_time = hours + ":" + minutes + " " + suffix;

        return current_time;

    }

    function fieldTimeOptions(time, identifier) {
        for (var i = 0; i < time; i++) {
            num = pad(i, 2)
            $(identifier).append(
                '<option value="' + num + '">' + num + '</option>');
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function displayAllTasks() {
        for (var i in localStorage) {
            if (Math.floor(i) == i && $.isNumeric(i)) {
                task = JSON.parse(localStorage[i]);
                repeat = localStorage.getItem('repeater'+task.id)
                if (dayCount < day) {
                  repeat++;
                  localStorage.setItem('repeater'+task.id, task.repeat);
                }

                if(repeat % task.repeat === 0){
                  setCountDownTime(task.id, task.hours, task.min);
                  prependTask(task.id, task.title, task.hours, task.min, task.repeat, task.startHour, task.startMin, task.amPm);
                }
            }
        }
    }

    function setCountDownTime(id, hours, min) {
      countDownH[id] = hours;
      countDownM[id] = min;
      countDownS[id] = 00;
    }

    function prependTask(id, title, hours, min, repeat, startHour, startMin, amPm) {

        $('.scheduleTasks').append(
            '<div id="' + id + '" class="taskItem">' +
            '<div id="' + id + '" class="dot"></div>' +
            '<div class="info">' +
            '<div class="topInfo">' +
            '<h1>' + title + '</h1>' +
            '<span class="' + id + '">' + hours + ':' + min + ':00</b></span>' +
            '</div>' +
            '<div class="botInfo">' +
            '<h2>' + repeat + ' Task</h1>' +
            '<span class="time">' + startHour + ':' + startMin + ' ' + amPm + '</span>' +
            '</div>' +
            '</div>' +
            '<div id="'+ id +'" class="deleteTask"><p>x</p></div>' +
            '</div>');
    }

    function updateLog(id) {

      task = getTaskById(id);
      totalTime = localStorage.getItem('totalTime'+id);
      minToTimeVar = minToTime(totalTime);
      console.log(totalTime+':'+minToTimeVar);
      $('#totalTime'+id).html(minToTimeVar);

    }

    function appendTaskToLog(id,title,time){
      $('.scheduleTasksLog').append(
        '<div id="' + id +'" class="taskLog">' +
          '<h1 class="titleLog">' + title + '</h1>' +
          '<h2 class="totalHours">Total Time: <b id=totalTime'+ id +'>' + time + '</b></h2>' +
        '</div>');
    }

    function minToTime(totalTime){
      hours = Math.round(totalTime / 60);
      mins = totalTime % 60;
      time = pad(hours, 2) + ":" + pad(mins, 2);
      console.log('minToTime: ' + time);
      return time;
    }

    function displayAllLogs(){
      for (var i in localStorage) {
          if (Math.floor(i) == i && $.isNumeric(i)) {
              task = JSON.parse(localStorage[i]);
              totalTime = localStorage.getItem('totalTime'+task.id);
              appendTaskToLog(task.id, task.title, minToTime(totalTime));
          }
      }
    }

    function hideAllSectionsExcept(id) {
        $(id)
            .css('display', 'flex')
            .animate({
                left: '0%'
            }, 500);

        $('section:not(' + id + ')').animate({
                left: '-100%'
            }, 500, function() {
                $(this).css('display', 'none');
            });
    }

    function tabSelection(tab) {
        $('.tab:not(' + tab + ')').css('box-shadow', '0px 0px 0px #b52da8');
        $('.tab' + tab).css('box-shadow', 'inset 0px -5px 0px #b52da8');
    }

    function getTaskById(id) {
        task = JSON.parse(localStorage[id]);
        return task;
    }

    function addTask() {
        var fields = {};
        var repeat = {};

        fields['id'] = idCount;

        $('.field').each(function() {
            fields[$(this).attr('id')] = $(this).val();
        });

        localStorage.setItem(idCount, JSON.stringify(fields));

        setCountDownTime(fields['id'], fields['hours'], fields['min']);

        prependTask(fields['id'], fields['title'], fields['hours'], fields['min'], fields['repeat'], fields['startHour'], fields['startMin'], fields['amPm'])

        localStorage.setItem('repeater'+fields['id'], fields['repeat']);

        if ($('#log').is(':checked')) {
          localStorage.setItem('totalTime'+fields['id'], 0);
          appendTaskToLog(fields['id'], fields['title'], minToTime(0));
        }

        idCount++;
        localStorage.setItem('idCount', idCount);

        resetValues();
        tabSelection('.schedule');
        hideAllSectionsExcept('#schedule');
    }

    function resetValues() {
        $('.field').each(function() {
            $(this).val('');
        });
    }

    $('.copyrights').text('\u00A9' + (new Date).getFullYear() + ' PCCC');

})
