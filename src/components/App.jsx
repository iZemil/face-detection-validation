import React, { Component } from 'react';
import { observable, action, set } from 'mobx';
import { observer, inject } from 'mobx-react';
import cn from 'classnames';
import { Button } from 'semantic-ui-react';
import * as faceapi from 'face-api.js';

const MODEL_URL = '/models';

const Loader = () => (
    <div className="Loader">
        <span>We are trying to detect your face</span>
        <i className="loading" />
    </div>
);

const wait = ms => new Promise((r, j) => setTimeout(r, ms));

function resizeCanvasAndResults(dimensions, canvas, results) {
    const { width, height } =
        dimensions instanceof HTMLVideoElement
            ? faceapi.getMediaDimensions(dimensions)
            : dimensions;
    canvas.width = width;
    canvas.height = height;

    // resize detections (and landmarks) in case displayed image is smaller than
    // original size
    return faceapi.resizeResults(results, { width, height });
}

@observer
export default class App extends Component {
    @observable statuses = {
        isDetected: false,
        isFetching: true,
        isStream: false
    };

    constructor(props) {
        super(props);

        this.detectFrame = this.detectFrame.bind(this);
        // console.log(faceapi.nets);
    }

    async componentDidMount() {
        await this.loadModels();
    }

    @action.bound
    async startDetect() {
        const video = this.videoRef;
        const webCamPromise = navigator.mediaDevices
            .getUserMedia({
                audio: false,
                video: {
                    facingMode: 'user',
                    width: 640,
                    height: 480
                }
            })
            .then(stream => {
                video.srcObject = stream;

                return new Promise((resolve, reject) => {
                    video.onloadedmetadata = () => {
                        set(this.statuses, {
                            isFetching: false,
                            isStream: true
                        });

                        video.play();
                        resolve();
                    };
                });
            })
            .catch(err => {
                console.warn('getUserMedia Error: ', err);

                set(this.statuses, {
                    isFetching: true
                });
            });

        await wait(2000);
        webCamPromise.then(() => this.detectFrame());
    }

    async loadModels() {
        await faceapi.loadFaceDetectionModel(MODEL_URL);
        // await faceapi.loadFaceLandmarkModel(MODEL_URL);
        // await faceapi.loadFaceRecognitionModel(MODEL_URL);
    }

    async detectFrame() {
        const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
        const result = await faceapi.detectSingleFace(this.videoRef, options);

        if (result) {
            const resizedDetections = resizeCanvasAndResults(this.videoRef, this.canvasRef, [
                result
            ]);

            faceapi.drawDetection(canvas, resizedDetections);

            if (!this.statuses.isDetected) {
                set(this.statuses, {
                    isDetected: true,
                    isFetching: true
                });
            }
        }

        requestAnimationFrame(() => {
            this.detectFrame();
        });
    }

    render() {
        const [width, height] = [640, 480];
        const { isDetected, isFetching, isStream } = this.statuses;

        return (
            <div className="app">
                <div className="container">
                    <div className="motion-detection__window">
                        {!isStream && (
                            <Button
                                positive
                                icon="play"
                                size="large"
                                onClick={this.startDetect}
                                className="detect-btn"
                                content="Detect face"
                            />
                        )}

                        {!isFetching && <Loader />}

                        <video
                            id="video"
                            ref={el => {
                                this.videoRef = el;
                            }}
                            width={width}
                            height={height}
                            className={cn('video', { video_blur: !isDetected })}
                        />
                        <canvas
                            id="canvas"
                            ref={el => {
                                this.canvasRef = el;
                            }}
                            width={width}
                            height={height}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
