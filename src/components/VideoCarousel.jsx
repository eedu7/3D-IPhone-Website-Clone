import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constant/index.js";
import { pauseImg, playImg, replayImg } from "../utils/index.js";

gsap.registerPlugin(ScrollTrigger);

export const VideoCarousel = () => {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false,
    });

    const [loadedData, setLoadedData] = useState([]);
    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

    useEffect(() => {
        const sliderAnimation = gsap.to("#slider", {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut",
        });

        const videoAnimation = gsap.to("#video", {
            scrollTrigger: {
                trigger: "#video",
                toggleActions: "restart none none none",
            },
            onComplete: () => {
                setVideo(prev => ({
                    ...prev,
                    startPlay: true,
                    isPlaying: true,
                }));
            },
        });

        return () => {
            sliderAnimation.kill();
            videoAnimation.kill();
        };
    }, [isEnd, videoId]);

    useEffect(() => {
        let currentProgress = 0;
        const span = videoSpanRef.current[videoId];

        if (span) {
            const anim = gsap.to(span, {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100);
                    if (progress !== currentProgress) {
                        currentProgress = progress;

                        const width = window.innerWidth < 760 ? "10vw" :
                            window.innerWidth < 1200 ? "10vw" : "4vw";

                        gsap.to(videoDivRef.current[videoId], { width });
                        gsap.to(span, { width: `${currentProgress}%`, backgroundColor: "white" });
                    }
                },
                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], { width: "12px" });
                        gsap.to(span, { backgroundColor: "#afafaf" });
                    }
                },
            });

            if (videoId === 0) {
                anim.restart();
            }

            const animUpdate = () => {
                anim.progress(videoRef.current[videoId]?.currentTime /
                    hightlightsSlides[videoId].videoDuration || 0);
            };

            if (isPlaying) {
                gsap.ticker.add(animUpdate);
            } else {
                gsap.ticker.remove(animUpdate);
            }

            return () => {
                gsap.ticker.remove(animUpdate);
            };
        }
    }, [videoId, startPlay, isPlaying]);

    useEffect(() => {
        if (loadedData.length > 3) {
            if (!isPlaying) {
                videoRef.current[videoId]?.pause();
            } else {
                startPlay && videoRef.current[videoId]?.play();
            }
        }
    }, [startPlay, videoId, isPlaying, loadedData]);

    const handleProcess = (type, i) => {
        switch (type) {
            case "video-end":
                setVideo(prev => ({ ...prev, isEnd: true, videoId: i + 1 }));
                break;
            case "video-last":
                setVideo(prev => ({ ...prev, isLastVideo: true }));
                break;
            case "video-reset":
                setVideo(prev => ({ ...prev, videoId: 0, isLastVideo: false }));
                break;
            case "pause":
                setVideo(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
                break;
            case "play":
                setVideo(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
                break;
            default:
                return video;
        }
    };

    const handleLoadedMetaData = (i, e) => setLoadedData(prev => [...prev, e]);

    return (
        <>
            <div className="flex items-center">
                {hightlightsSlides.map((list, i) => (
                    <div key={list.id} id="slider" className="sm:pr-20 pr-10">
                        <div className="video-carousel_container">
                            <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                                <video
                                    id="video"
                                    playsInline
                                    className={`${list.id === 2 ? "translate-x-44" : ""} pointer-events-none`}
                                    preload="auto"
                                    muted
                                    ref={el => videoRef.current[i] = el}
                                    onEnded={() => i !== 3 ? handleProcess("video-end", i) : handleProcess("video-last")}
                                    onPlay={() => setVideo(prev => ({ ...prev, isPlaying: true }))}
                                    onLoadedMetadata={e => handleLoadedMetaData(i, e)}
                                >
                                    <source src={list.video} type="video/mp4" />
                                </video>
                            </div>
                            <div className="absolute top-12 left-[5%] z-10">
                                {list.textLists.map((text, i) => (
                                    <p key={i} className="md:text-2xl text-xl font-medium">{text}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="relative flex-center mt-10">
                <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
                    {videoRef.current.map((_, i) => (
                        <span
                            key={i}
                            className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
                            ref={el => videoDivRef.current[i] = el}
                        >
                            <span
                                className="absolute h-full w-full rounded-full"
                                ref={el => videoSpanRef.current[i] = el}
                            />
                        </span>
                    ))}
                </div>
                <button className="control-btn">
                    <img
                        src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
                        alt={isLastVideo ? "replay" : !isPlaying ? "play" : "pause"}
                        onClick={() => isLastVideo ? handleProcess("video-reset") : handleProcess(isPlaying ? "pause" : "play")}
                    />
                </button>
            </div>
        </>
    );
};

