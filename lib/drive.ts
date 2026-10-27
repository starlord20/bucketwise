export async function fetchDriveStatements(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?q=name contains "statement" or name contains "529"&fields=files(id,name)', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  return res.json();
}
