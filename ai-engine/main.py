import os
import re
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="Inertia AI Talent Matrix Engine (Advanced NLP)")

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Senin genişletilmiş Kaggle veri setin
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

# 🧠 TÜRKÇE NLP: Özel Dolgu Kelimeleri ve Proje Jargonu Filtresi
TURKISH_STOP_WORDS = {
    'acaba', 'ama', 'aslında', 'az', 'bazı', 'belki', 'biri', 'birkaç', 'birşey', 'biz', 'bu', 'çok', 'çünkü', 'da', 'daha', 'de', 'defa', 'diye', 'eğer', 'en', 'gibi', 'hem', 'hep', 'hepsi', 'her', 'hiç', 'için', 'ile', 'ise', 'kez', 'ki', 'kim', 'mı', 'mu', 'mü', 'nasıl', 'ne', 'neden', 'nerde', 'nerede', 'nereye', 'niçin', 'niye', 'o', 'sanki', 'şey', 'siz', 'şu', 'tüm', 've', 'veya', 'ya', 'yani', 'bir', 
    'yapılacak', 'edilecek', 'kullanılarak', 'kullanılacak', 'kullanarak', 'olarak', 'olan', 'olacak', 'gelişmiş', 'proje', 'projede', 'kısmında', 'tarafında', 'metotları', 'tasarlanacak', 'yapılması', 'gerekir', 'istiyoruz', 'gerekmektedir', 'kapsamında', 'içinde', 'yapı', 'sistem'
}

# İngilizce ve Türkçe gereksiz kelimeleri birleştir
ALL_STOP_WORDS = list(ENGLISH_STOP_WORDS.union(TURKISH_STOP_WORDS))

class UserData(BaseModel):
    id: int
    name: str
    skills: List[str]

class TaskRequest(BaseModel):
    task_description: str
    users: List[UserData]

@app.post("/api/recommend-user")
def recommend_user(data: TaskRequest):
    # 1. Metin Temizliği (Noktalama işaretlerini ve özel karakterleri sil)
    clean_task_text = re.sub(r'[^\w\s]', ' ', data.task_description.lower())
    
    user_texts = []
    user_profiles = []
    
    for user in data.users:
        enriched_skills = []
        for skill in user.skills:
            skill_lower = skill.lower()
            enriched_skills.append(skill_lower)
            
            # Kategoriyi ekleyerek eşleşmeyi güçlendir
            matched = df_kaggle[df_kaggle['skill_name'] == skill_lower]
            if not matched.empty and 'category' in df_kaggle.columns:
                category = matched.iloc[0]['category']
                enriched_skills.append(str(category))
        
        skills_text = " ".join(enriched_skills)
        user_texts.append(skills_text)
        user_profiles.append(user)
        
    if not user_texts:
        return {"recommendations": []}

    # 2. Gelişmiş TF-IDF: Sadece saf yetenek kelimelerini analiz et
    vectorizer = TfidfVectorizer(stop_words=ALL_STOP_WORDS)
    all_texts = [clean_task_text] + user_texts
    
    try:
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    except ValueError:
        # Eğer cümlenin tamamı "stop_words" ise sistem çökmesin
        cosine_similarities = [0.0] * len(user_profiles)
    
    recommendations = []
    for idx, user in enumerate(user_profiles):
        raw_score = cosine_similarities[idx]
        
        # 3. Matematiksel Boost: Kısa metinlerdeki çekingen skoru agresif hale getiriyoruz
        match_percentage = round((raw_score * 1.5) * 100, 1) 
        
        if match_percentage < 0:
            match_percentage = 0.0
            
        # Kaggle ağırlıklarına göre skoru manipüle etme
        for skill in user.skills:
            weight_match = df_kaggle[df_kaggle['skill_name'] == skill.lower()]
            if not weight_match.empty and 'weight' in df_kaggle.columns:
                match_percentage += float(weight_match.iloc[0]['weight']) * 2
        
        match_percentage = min(100.0, round(match_percentage, 1))

        recommendations.append({
            "user_id": user.id,
            "name": user.name,
            "match_score": match_percentage,
            "matched_skills": user.skills
        })
        
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {
        "task": data.task_description,
        "engine": "Advanced NLP TF-IDF + TR/EN StopWords",
        "recommendations": recommendations
    }