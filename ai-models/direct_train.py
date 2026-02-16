from ultralytics import YOLO

model = YOLO('yolov8n.pt')

results = model.train(
    data='data/yolo_dataset_final_fixed/dataset.yaml',
    epochs=100,
    batch=16,
    imgsz=640,
    device='cpu',
    save_period=1,
    verbose=True
)