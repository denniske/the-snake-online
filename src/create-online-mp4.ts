// @ts-ignore
import ffmpegRaw from '@ffmpeg-installer/ffmpeg';
// @ts-ignore
import ffprobeRaw from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegRaw.path);
ffmpeg.setFfprobePath(ffprobeRaw.path);


ffmpeg()
    .input('./src/online.png')
    .loop(60*60*10) // 10 hours
    .fps(29.7)
    .outputOption('-pix_fmt yuv420p')
    .on('progress', function(progress) {
        console.log('Processing: ' + progress.timemark + ' ' + progress.currentKbps + ' kbps');
    })
    .on('end', function() {
        console.log('File has been converted successfully');
    })
    .on('error', function(err) {
        console.log('An error happened: ' + err.message);
    })
    .save('./src/online.mp4');
