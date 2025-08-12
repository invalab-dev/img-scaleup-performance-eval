"use client";

import {checkProgress, uploadImages} from "@/app/proxy";
import {useEffect, useState, useTransition} from "react";
import {Option, ProgressResponse, UploadResponse} from "@/app/class";


export default function Home() {
  const fileNames = ["/files/0.jpg", "/files/1.jpg", "/files/2.jpg", "/files/3.jpg"];

  const [isPending, startTransition] = useTransition();
  const [countList, setCountList] = useState<number[]>([0, 0, 0, 0]);
  const [imageList, setImageList] = useState<File[]>([]);
  const [option, setOption] = useState<Option>(Option.LOCAL_GPU);
  const [progressResponses, setProgressResponses] = useState<ProgressResponse[]>([]);

  useEffect(() => {
    (async function(): Promise<File[]> {
      const responses = await Promise.all(fileNames.map((fileName) => fetch(fileName)));
      const blobs = await Promise.all(responses.map(e => e.blob()));

      const imageList = [];
      for (let i = 0; i < blobs.length; i++) {
        imageList.push(new File([blobs[i]], fileNames[i], { type: blobs[i].type }));
      }
      return imageList;
    })().then((imageList) => setImageList(imageList));
  }, []);

  const MAX_COUNT = 10;

  function changeCountList(n: number, count: number) {
    console.log(`count: ${count}`);

    // validate count value
    if(count > MAX_COUNT) return;
    if(isNaN(count)) count = 0;

    const newCountList = [...countList];
    newCountList[n] = count;
    setCountList(newCountList);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData();
    for(let i = 0; i < countList.length; i++) {
      formData.append("images", imageList[i]);
      formData.append("count", `${countList[i]}`);
    }
    formData.append("option", option);

    startTransition(() => {
      uploadImages(formData).then((res) => {
        console.log(`[1]res: ${res}`);

        const uploadResponses = res.uploadResponses as UploadResponse[];

        console.log(`${uploadResponses.length}개 중 ${uploadResponses.filter((e) => e.task_id != null)}개 업로드 성공`);

        const cancel = setInterval(async () => {
          const newProgressResponses = [];
          for(const uploadResponse of uploadResponses.filter((e) => e.task_id != null)) {
            const progressResponse = await checkProgress(option, uploadResponse.task_id!);
            newProgressResponses.push(progressResponse);
          }
          console.log(`[2]newProgressResponses: ${newProgressResponses}`);
          if(newProgressResponses.every((e) => e.status == "done" || e.status == "error")) {
            clearInterval(cancel);
          }

          setProgressResponses(newProgressResponses);
        }, 2000);
      });
    });

  }

  return (
    <div className={"w-screen"}>
      <div className={"navbar w-full shadow-sm"}>
        <p className={"text-3xl font-bold"}>이미지 스케일업 성능 평가</p>
      </div>
      <div className={"flex flex-row items-stretch p-4 gap-x-4"}>
        <div className={"flex-1 flex flex-col min-w-80 p-8 border-2 border-black"}>
          <div className={"h-14 flex flex-row justify-start items-center gap-x-4"}>
            <div className="dropdown">
              <div tabIndex={0} role="button" className="w-54 btn m-1">{option}</div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                {Object.values(Option).map((option, i) => (
                  <li key={i}
                      onClick={() => {

                        setOption(option);
                        (document.activeElement as (HTMLElement | null))?.blur();
                      }}><a>{option}</a></li>
                ))}
              </ul>
            </div>
            <p className={"text-2xl font-bold"}>요청</p>
          </div>
          <div className={"divider"}></div>
          <form encType={"multipart/form-data"} onSubmit={onSubmit}>
            <div className={"flex flex-row gap-x-10 p-2 overflow-x-auto"}>
              <div className={"bg-neutral-100 flex flex-col items-center gap-y-4 p-4"}>
                <div style={{backgroundImage: `url(${fileNames[0]})`}}
                     className={`w-60 h-60 bg-white bg-contain bg-no-repeat bg-center`}></div>
                <p>크기: 251.38KB</p>
                <input type="number"
                       placeholder={`개수 (${MAX_COUNT}개 미만)`}
                       value={countList[0]}
                       onChange={(e) => {
                         const value = parseInt(e.target.value);
                         e.target.value = "";
                         changeCountList(0, value);
                       }}
                       className={"input"}/>
              </div>
              <div className={"w-80 bg-neutral-100 flex flex-col items-center gap-y-4 p-4"}>
                <div style={{backgroundImage: `url(${fileNames[1]})`}}
                     className={`w-60 h-60 bg-white bg-contain bg-no-repeat bg-center`}></div>
                <p>크기: 3.19MB</p>
                <input type="number"
                       placeholder={`개수 (${MAX_COUNT}개 미만)`}
                       value={countList[1]}
                       onChange={(e) => {
                         const value = parseInt(e.target.value);
                         e.target.value = "";
                         changeCountList(1, value);
                       }}
                       className={"input"}/>
              </div>
              <div className={"w-80 bg-neutral-100 flex flex-col items-center gap-y-4 p-4"}>
                <div style={{backgroundImage: `url(${fileNames[2]})`}}
                     className={`w-60 h-60 bg-white bg-contain bg-no-repeat bg-center`}></div>
                <p>크기: 8MB</p>
                <input type="number"
                       placeholder={`개수 (${MAX_COUNT}개 미만)`}
                       value={countList[2]}
                       onChange={(e) => {
                         const value = parseInt(e.target.value);
                         e.target.value = "";
                         changeCountList(2, value);
                       }}
                       className={"input"}/>
              </div>
              <div className={"w-80 bg-neutral-100 flex flex-col items-center gap-y-4 p-4"}>
                <div style={{backgroundImage: `url(${fileNames[3]})`}}
                     className={`w-60 h-60 bg-white bg-contain bg-no-repeat bg-center`}></div>
                <p>크기: 15.8MB</p>
                <input type="number"
                       placeholder={`개수 (${MAX_COUNT}개 미만)`}
                       value={countList[3]}
                       onChange={(e) => {
                         const value = parseInt(e.target.value);
                         e.target.value = "";
                         changeCountList(3, value);
                       }}
                       className={"input"}/>
              </div>
            </div>
            <div className={"flex flex-col items-center"}>
              <button disabled={(imageList.length == 0) || isPending} className={"btn w-60 mt-10"}>요청 보내기</button>
            </div>
          </form>
        </div>
        <div className={"flex-none w-100 p-8 border-2 border-black"}>
          <div className={"h-14 flex flex-row items-center"}>
            <p className={"text-2xl font-bold"}>로그</p>
          </div>
          <div className={"divider"}></div>
          <div>
            {progressResponses.map((progressResponse, i) => (
              <div key={i}>
                {JSON.stringify(progressResponses)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
