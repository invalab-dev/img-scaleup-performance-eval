"use server"

const baseUrl = "http://localhost:3001"; // 10.0.2.6

export async function uploadImages(formData: FormData) {
    const images = formData.getAll("images") as File[];
    const count = formData.getAll("count").map((e) => parseInt(e as string));

    const jobs = [];
    for(let i = 0; i < count.length; i++) {
        for(let j = 0; j < count[i]; j++) {
            jobs.push(images[i]);
        }
    }

    return await Promise.all(jobs.map(async (job) => {
        const formData = new FormData();
        formData.append("image", job);

        const res = await fetch(`${baseUrl}/upload`, {
            method: "POST",
            body: formData
        });

        const response =  {
          statusCode: res.status,
          data: await res.json()
        };
        console.log(response);
        return response;
    }));
}

export async function checkProgress(filename: string) {
    const res = await fetch(`${baseUrl}/progress/${filename}`, {
        method: "GET",
    });
    return await res.json();
}