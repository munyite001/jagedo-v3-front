import { SkillsTable } from "@/components/BuilderConfiguration/SkillsTable";
import { useBuilderSkills } from "@/hooks/useBuilderSkills";

const Index = () => {
  const { skills, addSkill, updateSkill, deleteSkill } = useBuilderSkills();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <SkillsTable
          skills={skills}
          onAdd={addSkill}
          onUpdate={updateSkill}
          onDelete={deleteSkill}
        />
      </main>
    </div>
  );
};

export default Index;
