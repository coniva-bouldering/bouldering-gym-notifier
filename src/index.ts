addEventListener('scheduled', (event: any) => {
    event.waitUntil(handleScheduled(event))
})

async function handleScheduled(event: any) {
    console.log(`Hello : ${new Date()}`)
}
