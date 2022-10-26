import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg";
const ffmpeg = createFFmpeg({log: true});

export default async function convertVideoToGif(mp4URL) {
    await ffmpeg.load();
    ffmpeg.FS("writeFile", mp4URL, await fetchFile(this.state.video));
    await ffmpeg.run("-i", "vid.mp4", "-s", "480x320", "-r", "3", "-t", String(this.state.length), "-ss", String(this.state.start), "-f", "gif", "out.gif");
    const data = ffmpeg.FS("readFile", "out.gif");

    return URL.createObjectURL(new Blob([data.buffer], {type: "image/gif"}));
}