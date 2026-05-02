<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $skills = [
            ['name' => 'Project Management', 'category' => 'hard'],
            ['name' => 'Communication', 'category' => 'soft'],
            ['name' => 'Problem Solving', 'category' => 'soft'],
            ['name' => 'Teamwork', 'category' => 'soft'],
            ['name' => 'Critical Thinking', 'category' => 'soft'],
            ['name' => 'Creativity', 'category' => 'soft'],
            ['name' => 'Emotional Intelligence', 'category' => 'soft'],
            ['name' => 'Leadership', 'category' => 'soft'],
            ['name' => 'DevOps', 'category' => 'hard'],
            ['name' => 'Data Science', 'category' => 'hard'],
            ['name' => 'Mobile Development', 'category' => 'hard'],
            ['name' => 'UI/UX Design', 'category' => 'hard'],
            ['name' => 'Cloud Computing', 'category' => 'hard'],
            ['name' => 'Cybersecurity', 'category' => 'hard'],
            ['name' => 'Agile Methodology', 'category' => 'hard'],
            ['name' => 'Team Leadership', 'category' => 'soft'],
            ['name' => 'Data Analysis', 'category' => 'hard'],
            ['name' => 'Time Management', 'category' => 'soft'],
            ['name' => 'Adaptability', 'category' => 'soft'],
            ['name' => 'Machine Learning', 'category' => 'hard'],
        ];

        foreach ($skills as $skill) {
            Skill::updateOrCreate(['name' => $skill['name']], $skill);
        }
    }
}
