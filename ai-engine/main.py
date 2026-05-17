import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Inertia AI Talent Matrix Engine")

# CORS ayarları (Laravel veya React doğrudan bağlanmak isterse diye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kaggle / Sentetik Veri Seti Yol Haritası
# Normalde Kaggle'dan indirdiğin 'skills_dataset.csv' dosyasını buraya koyarsın.
# Dosya yoksa sistemin çökmemesi için otomatik bir DataFrame oluşturuyoruz.
DATASET_PATH = os.path.join(os.path.dirname(__file__), "extended_skill_task_assignment.csv")

if os.path.exists(DATASET_PATH):
    df_kaggle = pd.read_csv(DATASET_PATH)
else:
    # Veri seti henüz sunucuya gelmediyse örnek bir Kaggle veri yapısı simüle edelim
    kaggle_data = {
        'skill_name': ['react', 'vue', 'angular', 'laravel', 'php', 'python', 'javascript', 'tailwind css', 'mysql', 'redis', 'docker'],
        'category': ['frontend', 'frontend', 'frontend', 'backend', 'backend', 'data science', 'frontend', 'frontend', 'database', 'database', 'devops'],
        'weight': [1.2, 1.1, 1.1, 1.3, 1.0, 1.4, 1.1, 1.0, 1.1, 1.3, 1.4] # Algoritma ağırlıkları
    }
    df_kaggle = pd.DataFrame(kaggle_data)
    df_kaggle.to_csv(DATASET_PATH, index=False)

class UserData(BaseModel):
    id: int
    name: str
    skills: List[str]

class TaskRequest(BaseModel):
    task_description: str
    users: List[UserData]

@app.post("/api/recommend-user")
def recommend_user(data: TaskRequest):
    task_text = data.task_description.lower()
    
    user_texts = []
    user_profiles = []
    
    for user in data.users:
        # Kullanıcının sahip olduğu yetenekleri Kaggle veri setiyle zenginleştiriyoruz
        enriched_skills = []
        for skill in user.skills:
            skill_lower = skill.lower()
            enriched_skills.append(skill_lower)
            
            # Eğer kullanıcının yeteneği Kaggle veri setinde varsa, kategorisini de metne ekle (Eşleşme doğruluğunu artırır)
            matched = df_kaggle[df_kaggle['skill_name'] == skill_lower]
            if not matched.empty:
                category = matched.iloc[0]['category']
                enriched_skills.append(category) # Örn: 'laravel' yanına 'backend' kelimesini de ekliyoruz
        
        skills_text = " ".join(enriched_skills)
        user_texts.append(skills_text)
        user_profiles.append(user)
        
    if not user_texts:
        return {"recommendations": []}

    # --- MAKİNE ÖĞRENMESİ TABANLI METİN BENZERLİĞİ ---
    vectorizer = TfidfVectorizer(stop_words='english')
    all_texts = [task_text] + user_texts
    tfidf_matrix = vectorizer.fit_transform(all_texts)
    
    # İlk satır (görev) ile diğer tüm satırlar (kullanıcılar) arasındaki benzerlik matrisi
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    recommendations = []
    for idx, user in enumerate(user_profiles):
        # Yüzdelik skor türetme
        score = cosine_similarities[idx]
        match_percentage = round(score * 100, 1)
        
        # Eğer hiç eşleşme yoksa (0.0 ise) arka plana göre ufak bir taban şans tanıyalım ya da 0 verelim
        if match_percentage == 0:
            match_percentage = 5.0
            
        # Kaggle ağırlıklarına göre skoru manipüle etme (Opsiyonel Gelişmiş Özellik)
        for skill in user.skills:
            weight_match = df_kaggle[df_kaggle['skill_name'] == skill.lower()]
            if not weight_match.empty:
                match_percentage += weight_match.iloc[0]['weight'] * 2
        
        match_percentage = min(100.0, round(match_percentage, 1))

        recommendations.append({
            "user_id": user.id,
            "name": user.name,
            "match_score": match_percentage,
            "matched_skills": user.skills
        })
        
    # En yüksek skordan en düşüğe sırala
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {
        "task": data.task_description,
        "engine": "TF-IDF + Kaggle Matrix Skills Weighting",
        "recommendations": recommendations
    }