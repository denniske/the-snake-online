// @ts-ignore
import ffmpegRaw from '@ffmpeg-installer/ffmpeg';
// @ts-ignore
import ffprobeRaw from '@ffprobe-installer/ffprobe';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegRaw.path);
ffmpeg.setFfprobePath(ffprobeRaw.path);

import { Carina } from 'carina';
import * as ws from 'ws';

Carina.WebSocket = ws.default;

// @ts-ignore
import { Client, OAuthProvider, DefaultRequestRunner } from '@mixer/client-node';


const channelName = process.env.MIXER_CHANNEL_NAME;
const channelId = process.env.MIXER_CHANNEL_ID;
const clientId = process.env.MIXER_CLIENT_ID;
const twitchStreamKey = process.env.TWITCH_STREAM_KEY;

log('Server started.');


let online: boolean = null;
let command: FfmpegCommand = null;

function channelUpdated(data: any) {
    if (data.online == online) return;

    online = data.online;

    log('Mixer channel', channelName, 'is', online ? 'online.' : 'offline.');

    if (online) {
        log('Server starting stream.');
        command = ffmpeg()
            .input('./assets/online.mp4')
            .native()
            .videoCodec('libx264')
            .fps(29.7)
            .size('1280x720')
            .format('flv')
            .output('rtmp://live-fra.twitch.tv/app/' + twitchStreamKey)
            .on('progress', function(progress) {
                log('Processing: ' + progress.timemark + ' ' + progress.currentKbps + ' kbps');
            })
            .on('error', function(err, stdout, stderr) {
                log('Error: ' + err.message);
                command = null;
                // Retry in 5 seconds
                setTimeout(() => {
                    if (command == null) {
                        channelUpdated({online: online});
                    }
                }, 5000);
            })
            .on('end', () => {
                log("Server stream ended unexpectedly.");
            });
            command
            .run();
    } else {
        if (command) {
            log('Server shutting down stream.');
            command.kill('SIGKILL');
            command = null;
        }
    }
}

function log(...message: any[]) {
    console.log(new Date().toLocaleTimeString() + ' ' + message.join(' '));
}


const client = new Client(new DefaultRequestRunner());

client.use(<any>new OAuthProvider(client, {
    clientId: clientId,
}));

client.request('GET', `channels/${channelName}`).then((res: any) => {
    channelUpdated(res.body);
});

const ca = new Carina({
    queryString: {
        'Client-ID': clientId,
    },
    isBot: true,
}).open();

ca.subscribe(`channel:${channelId}:update`, (data:any) => {
    if (data.online == null) return;
    channelUpdated(data);
});

log('Server subscribed to mixer.');
