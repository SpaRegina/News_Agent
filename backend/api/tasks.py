from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from api.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Задачи"])

@router.get("/", response_model=List[schemas.TaskOut])
def list_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.MonitoringTask).filter(models.MonitoringTask.owner_id == current_user.id).all()

@router.post("/", response_model=schemas.TaskOut)
def create_task(data: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sources_data = data.sources
    task_data = data.model_dump(exclude={"sources"})
    task = models.MonitoringTask(**task_data, owner_id=current_user.id)
    db.add(task)
    db.flush()
    for s in sources_data:
        source = models.NewsSource(**s.model_dump(), task_id=task.id)
        db.add(source)
    db.commit()
    db.refresh(task)
    return task

@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id,
        models.MonitoringTask.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task

@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, data: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id,
        models.MonitoringTask.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id,
        models.MonitoringTask.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    db.delete(task)
    db.commit()
    return {"ok": True}

@router.post("/{task_id}/pause")
def pause_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id, models.MonitoringTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    task.status = models.TaskStatus.paused
    db.commit()
    return {"status": "paused"}

@router.post("/{task_id}/resume")
def resume_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id, models.MonitoringTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    task.status = models.TaskStatus.active
    db.commit()
    return {"status": "active"}

@router.post("/{task_id}/run")
def manual_run(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id, models.MonitoringTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    from workers.celery_app import run_task
    run_task.delay(task_id)
    return {"message": "Задача запущена"}

@router.get("/{task_id}/runs", response_model=List[schemas.TaskRunOut])
def get_runs(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.MonitoringTask).filter(
        models.MonitoringTask.id == task_id, models.MonitoringTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return db.query(models.TaskRun).filter(models.TaskRun.task_id == task_id).order_by(models.TaskRun.started_at.desc()).limit(50).all()
