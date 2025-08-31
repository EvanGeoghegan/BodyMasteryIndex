 import { useRef, useCallback } from "react";
 
 export function useLongPress(
   onLongPress: () => void,
   onRelease: () => void,
   ms = 5000,
   moveThreshold = 5
 ) {
   const timerRef = useRef<NodeJS.Timeout>();
   const start = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
   const triggeredRef = useRef(false);
 
   const startPress = useCallback((e: React.PointerEvent) => {
     start.current = { x: e.clientX, y: e.clientY };
     triggeredRef.current = false;
     timerRef.current = setTimeout(() => {
       triggeredRef.current = true;
       onLongPress();
     }, ms);
   }, [ms, onLongPress]);
 
   const clear = useCallback(() => {
     if (timerRef.current) {
       clearTimeout(timerRef.current);
       timerRef.current = undefined;
     }
   }, []);
 
   const move = useCallback((e: React.PointerEvent) => {
     if (!timerRef.current) return;
     const dx = Math.abs(e.clientX - start.current.x);
     const dy = Math.abs(e.clientY - start.current.y);
     if (dx > moveThreshold || dy > moveThreshold) {
       clear();
     }
   }, [clear, moveThreshold]);
 
   const end = useCallback(() => {
     clear();
     if (triggeredRef.current) {
       onRelease();
     }
   }, [clear, onRelease]);
 
   return {
     onPointerDown: startPress,
     onPointerMove: move,
     onPointerUp: end,
     onPointerLeave: end,
   } as const;
 }
 
 export default useLongPress;
