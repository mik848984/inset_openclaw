import { useCallback, useEffect, useRef, useState } from "react";
import {a} from "js-tiktoken/dist/core-e44f7fdc";

function getScrollBottom(elem: HTMLDivElement) {
    return elem.scrollHeight - elem.scrollTop - elem.clientHeight;
}

const maxAutoScrollValue = 200;
const autoScrollTimeValue = 50;

export function useMessengerScroll(isTyping: boolean) {
    const [showScrollDown, setShowScrollDown] = useState(false);
    const scrollRef = useRef<any>();
    const intervalId = useRef<NodeJS.Timeout>();
    const blockScrollBottom = useRef(false);

    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current?.scrollHeight;
    }, []);

    useEffect(scrollToBottom, []);

    useEffect(() => {
        addEventListener("scroll-bottom-messenger", scrollToBottom);
        return () => {
            removeEventListener("scroll-bottom-messenger", scrollToBottom);
        };
    }, []);

    useEffect(() => {
        const handleScrollStart = () => {
            blockScrollBottom.current = true;
        };

        const handleScrollEnd = () => {
            blockScrollBottom.current = false;
        };

        scrollRef.current?.addEventListener("touchstart", handleScrollStart);
        scrollRef.current?.addEventListener("touchend", handleScrollEnd);

        return () => {
            scrollRef.current?.removeEventListener("touchstart", handleScrollStart);
            scrollRef.current?.addEventListener("touchend", handleScrollEnd);
        };
    }, []);

    useEffect(() => {
        const onScrollDetect = () => {
            if (scrollTimeout.current) return;

            scrollTimeout.current = setTimeout(() => {
                if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                scrollTimeout.current = null;
            }, autoScrollTimeValue);
        };

        scrollRef.current?.addEventListener("scroll", onScrollDetect);

        return () => {
            scrollTimeout.current && clearTimeout(scrollTimeout.current);
            scrollRef.current?.removeEventListener("scroll", onScrollDetect);
        };
    }, []);

    useEffect(() => {
        if (!isTyping) return clearInterval(intervalId.current);

        intervalId.current = setInterval(() => {
            if (blockScrollBottom.current) return;

            if (!scrollRef.current || scrollTimeout.current) return;

            if (getScrollBottom(scrollRef.current) > maxAutoScrollValue) return;

            scrollToBottom();
        }, autoScrollTimeValue);

        return () => clearInterval(intervalId.current);
    }, [isTyping]);

    useEffect(() => {
        const handleScroll = () => {
            if (!scrollRef.current) return;

            if (getScrollBottom(scrollRef.current) > maxAutoScrollValue) {
                setShowScrollDown(true);
                return;
            }
            setShowScrollDown(false);
        };

        if (scrollRef.current) {
            scrollRef.current.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (scrollRef.current) {
                scrollRef.current.removeEventListener("scroll", handleScroll);
            }
        };
    }, [scrollRef.current]);

    return { scrollRef, scrollToBottom, showScrollDown };
}
