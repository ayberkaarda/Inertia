from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Inertia AI Talent Matcher")

# Gelen veri yapıları (Laravel'den bu formatta gelecek)
class UserData(BaseModel):
    id: int
    name: str
    skills: List[str]

class TaskRequest(BaseModel):
    task_description: str
    users: List[UserData]

@app.post("/api/recommend-user")
def recommend_user(data: TaskRequest):
    # 1. Görev açıklamasını al
    task_text = data.task_description.lower()
    
    # 2. Kullanıcıların yeteneklerini tek bir metin haline getir
    user_texts = []
    for user in data.users:
        skills_text = " ".join([skill.lower() for skill in user.skills])
        user_texts.append(skills_text)
        
    # Eğer kullanıcı veya yetenek yoksa boş dön
    if not user_texts:
        return {"recommendations": []}

    # 3. Makine Öğrenmesi: TF-IDF (Metin Vektörizasyonu) ve Kosinüs Benzerliği
    # NOT: İleride Kaggle modelini (örn: Random Forest) burada predict() edeceksin!
    vectorizer = TfidfVectorizer()
    all_texts = [task_text] + user_texts
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # Görev ile her bir kullanıcının yetenekleri arasındaki benzerliği ölç
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # 4. Sonuçları hazırla ve skora göre sırala
    recommendations = []
    for idx, user in enumerate(data.users):
        match_percentage = round(cosine_similarities[idx] * 100, 2)
        recommendations.append({
            "user_id": user.id,
            "name": user.name,
            "match_score": match_percentage,
            "matched_skills": user.skills
        })
        
    # En yüksek eşleşme oranına göre büyükten küçüğe sırala
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"task": data.task_description, "recommendations": recommendations}