import { useState, useEffect, useRef } from 'react'

export function useTypewriter(lines, delayBetween = 2000) {
    const [visibleLines, setVisibleLines] = useState([])
    const [done, setDone] = useState(false)
    const isMounted = useRef(true)

    useEffect(() => {
        isMounted.current = true
        setVisibleLines([])
        setDone(false)

        const run = async () => {
            for (const line of lines) {
                if (!isMounted.current) return
                await new Promise(r => setTimeout(r, 200))
                setVisibleLines(prev => [...prev, line])
                await new Promise(r => setTimeout(r, delayBetween))
            }
            if (isMounted.current) setDone(true)
        }

        run()
        return () => { isMounted.current = false }
    }, [])

    return { visibleLines, done }
}