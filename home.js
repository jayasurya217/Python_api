let ns = {};

// Create the model instance
ns.model = (function() {
    'use strict';

    let $event_pump = $('body');

    // Return the API
    return {
        'read': function() {
            let ajax_options = {
                type: 'GET',
                url: 'api/song',
                accepts: 'application/json',
                dataType: 'json'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_read_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        create: function(song) {
            let ajax_options = {
                type: 'POST',
                url: 'api/song',
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(person)
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_create_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        update: function(person) {
            let ajax_options = {
                type: 'PUT',
                url: `api/song/${song.song_id}`,
                accepts: 'application/json',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(person)
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_update_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        },
        'delete': function(song_id) {
            let ajax_options = {
                type: 'DELETE',
                url: `api/people/${song_id}`,
                accepts: 'application/json',
                contentType: 'plain/text'
            };
            $.ajax(ajax_options)
            .done(function(data) {
                $event_pump.trigger('model_delete_success', [data]);
            })
            .fail(function(xhr, textStatus, errorThrown) {
                $event_pump.trigger('model_error', [xhr, textStatus, errorThrown]);
            })
        }
    };
}());

// Create the view instance
ns.view = (function() {
    'use strict';

    let $song_id = $('#song_id'),
        $name = $('#name'),
        $duration = $('#duration');

    // return the API
    return {
        reset: function() {
            $song_id.val('');
            $name.val('');
            $duration.val('').focus();
        },
        update_editor: function(person) {
            $song_id.val(song.song_id);
            $name.val(song.name);
            $duration.val(song.duration).focus();
        },
        build_table: function(song) {
            let rows = ''

            // clear the table
            $('.song table > tbody').empty();

            // did we get a song array?
            if (song) {
                for (let i=0, l=song.length; i < l; i++) {
                    rows += `<tr data-song-id="${song[i].song_id}">
                        <td class="song_id">${song[i].song_id}</td>
                        <td class="name">${song[i].name}</td>
			<td class="duration">${song[i].duration}</td>
                        <td>${people[i].timestamp}</td>
                    </tr>`;
                }
                $('table > tbody').append(rows);
            }
        },
        error: function(error_msg) {
            $('.error')
                .text(error_msg)
                .css('visibility', 'visible');
            setTimeout(function() {
                $('.error').css('visibility', 'hidden');
            }, 3000)
        }
    };
}());

// Create the controller
ns.controller = (function(m, v) {
    'use strict';

    let model = m,
        view = v,
        $event_pump = $('body'),
        $song_id = $('#song_id'),
        $name = $('#name'),
        $duration = $('#duration');

    // Get the data from the model after the controller is done initializing
    setTimeout(function() {
        model.read();
    }, 100)

    // Validate input
    function validate(song_id, name) {
        return song_id !== "" && name !== "";
    }

    // Create our event handlers
    $('#create').click(function(e) {
        let song_id = $song_id.val(),
            name = $name.val();

        e.preventDefault();

        if (validate(song_id, name)) {
            model.create({
                'song_id': song_id,
                'name': name,
            })
        } else {
            alert('Problem with song_id or name input');
        }
    });

    $('#update').click(function(e) {
        let song_id = $song_id.val(),
            name = $name.val(),
            duration = $duration.val();

        e.preventDefault();

        if (validate(name, duration)) {
            model.update({
                song_id: song_id,
                name: name,
                duration: duration,
            })
        } else {
            alert('Problem with name or duration input');
        }
        e.preventDefault();
    });

    $('#delete').click(function(e) {
        let song_id = $song_id.val();

        e.preventDefault();

        if (validate('placeholder', name)) {
            model.delete(song_id)
        } else {
            alert('Problem with id or name input');
        }
        e.preventDefault();
    });

    $('#reset').click(function() {
        view.reset();
    })

    $('table > tbody').on('dblclick', 'tr', function(e) {
        let $target = $(e.target),
            song_id,
            name,
            duration;

        song_id = $target
            .parent()
            .attr('data-song-id');

        name = $target
            .parent()
            .find('td.name')
            .text();

        duration = $target
            .parent()
            .find('td.duration')
            .number();

        view.update_editor({
            song_id: song_id,
            name: name,
            duration: duration,
        });
    });

    // Handle the model events
    $event_pump.on('model_read_success', function(e, data) {
        view.build_table(data);
        view.reset();
    });

    $event_pump.on('model_create_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_update_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_delete_success', function(e, data) {
        model.read();
    });

    $event_pump.on('model_error', function(e, xhr, textStatus, errorThrown) {
        let error_msg = textStatus + ': ' + errorThrown + ' - ' + xhr.responseJSON.detail;
        view.error(error_msg);
        console.log(error_msg);
    })
}(ns.model, ns.view));