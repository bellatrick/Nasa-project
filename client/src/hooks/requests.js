const BASE_URL = "http://localhost:8000";

async function httpGetPlanets() {
  const response = await fetch(`${BASE_URL}/planets`);
  return await response.json();
}

async function httpGetLaunches() {
  const response = await fetch(`${BASE_URL}/launches`);
  const fetchedLaunches = await response.json();
  return fetchedLaunches.sort((a, b) => a.flightNumber - b.flightNumber);
}

async function httpSubmitLaunch(launch) {
  try {
    await fetch(`${BASE_URL}/launches`, {
      method: "POST",
      body: JSON.stringify(launch),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
    };
  }
}

async function httpAbortLaunch(id) {
try {
  return await fetch(`${BASE_URL}/launches/${id}`,{
    method:'DELETE'
   })
} catch (error) {
return {
  ok:false
}
}
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
