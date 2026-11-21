import json, subprocess, re, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scenes = json.load(open(f"{root}/tools/script.json"))
FPS = 30
PAD = 0.3   # silence after each scene (s)
LEAD = 0.2
out = []
t = 0.0
files = []
for i, s in enumerate(scenes):
    wav = f"{root}/public/audio/n{i:02d}.wav"
    subprocess.run(["espeak-ng","-v","mb-br3","-s","160","-g","4","-p","40","-w",wav,s["text"]],check=True)
    d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",wav]).decode())
    # trim leading/trailing silence
    trimmed = wav.replace(".wav","_t.wav")
    subprocess.run(["ffmpeg","-y","-v","error","-i",wav,"-af","silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5",trimmed],check=True)
    d = float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",trimmed]).decode())
    words = s["text"].split()
    # distribute word times by weight (letters + small bonus for punctuation pause)
    w = [len(re.sub(r"\W","",x))+ (3 if x[-1] in ".,:;" else 0) for x in words]
    tot = sum(w); acc = 0; ws = []
    for x, wt in zip(words, w):
        st = acc/tot*d; acc += wt; en = acc/tot*d
        ws.append({"w":x,"s":round(LEAD+st,3),"e":round(LEAD+en,3)})
    dur = LEAD + d + PAD
    frames = round(dur*FPS)
    out.append({**s,"audio":f"audio/n{i:02d}_t.wav","from":round(t*FPS),"frames":frames,"words":ws})
    t += frames/FPS
json.dump({"fps":FPS,"total":round(t*FPS),"scenes":out}, open(f"{root}/src/timeline.json","w"), ensure_ascii=False, indent=1)
print("total seconds", round(t,1), "frames", round(t*FPS))
for o in out: print(o["id"], round(o["frames"]/FPS,1))
