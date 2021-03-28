// Authenticate
function authenticate(ws) {
    ws.send(JSON.stringify({
        op: 2,
        d: {
            token: "ODIwNzA5MDE3NTE2NzY5Mjgx.YE5HKQ.3pnpetwzqZNmEKCyWSKGbF0z-Ec",
            capabilities: 61,
            properties: {
                os: "Linux",
                browser: "Chrome",
                device: "",
                system_locale: "en-US",
                browser_user_agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
                browser_version: "89.0.4389.82",
                os_version: "",
                referrer: "https://discord.com/",
                referring_domain: "discord.com",
                referrer_current: "",
                referring_domain_current: "",
                release_channel: "stable",
                client_build_number: 80728,
                client_event_source: null
            },
            presence: {
                status: "online",
                since: 0,
                activities: [],
                afk: false
            },
            compress: false,
            client_state: {
                guild_hashes: {},
                highest_last_message_id: "0",
                read_state_version: 0,
                user_guild_settings_version: -1
            }
        }
    }))
}

exports.authenticate = authenticate;

// Heartbeat
function heartbeat(ws, data) {
    // data['heartbeat_interval'] 
    let last_beat = data['heartbeat_interval'] / 2
    setInterval(() => {
        console.log("\nSending heartbeat: " + last_beat)
        ws.send(JSON.stringify({
            op: 1,
            d: last_beat
        }))
        last_beat += data['heartbeat_interval'] / 2
    }, last_beat)
}

exports.heartbeat = heartbeat;

// Ready
const filter = [
    'CHANNEL_UPDATE',
    'CHANNEL_DELETE',
    'READY_SUPPLEMENTAL',
    'VOICE_STATE_UPDATE',
    'GUILD_MEMBER_UPDATE',
    'STREAM_UPDATE',

    'VOICE_SERVER_UPDATE'
]

function ready(ws, data) {
    switch (data['t']) {
        case 'READY':
            console.log('Connected')
            voice(ws)
            break

        case 'STREAM_CREATE':
            rtc_server_id = data['d'].rtc_server_id
            break

        case 'STREAM_SERVER_UPDATE':
            stream_token = data['d'].token
            stream_endpoint = data['d'].endpoint
            break

        default:
            !filter.includes(data['t']) && console.log(data)
    }
}

exports.ready = ready;

// Voice
let voice_connected = false

function voice(ws) {
    ws.send(JSON.stringify({
        op: 4,
        d: {
            guild_id: !voice_connected && "822789081309773836",
            channel_id: !voice_connected && "822789081749651456",
            self_mute: false,
            self_deaf: false,
            self_video: false,
            preferred_region: null
        }
    }), () => {
        console.log("Joined voice channel")
        screen(ws)
    })
    voice_connected = true
}

exports.voice = voice;

// Screen Share
function screen(ws) {
    // start sharing
    ws.send(JSON.stringify({
        op: 18,
        d: {
            type: "guild",
            guild_id: "822789081309773836",
            channel_id: "822789081749651456",
            preferred_region: null
        }
    }), () => {
        // send stream key
        ws.send(JSON.stringify({
            op: 22,
            d: {
                paused: false,
                stream_key: "guild:822789081309773836:822789081749651456:820709017516769281"
            }
        }), () => console.log("Stream started"))
    })
}

exports.screen = screen;

// Data variables
let rtc_server_id
let stream_token, stream_endpoint