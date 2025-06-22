const { PrismaClient } = require('@prisma/client');

// Create two Prisma clients - one for source, one for destination
const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://characters_user:characters_password@localhost:5432/characters_db'
    }
  }
});


async function generateInsertStatements() {
  try {
    console.log('Fetching characters from source database...');
    
    // Fetch all characters from source database
    const characters = await sourcePrisma.character.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${characters.length} characters to migrate`);

    if (characters.length === 0) {
      console.log('No characters found in source database');
      return;
    }

    // Generate INSERT statements
    const insertStatements = characters.map(character => {
      // Escape single quotes in JSON data
      const escapedS3Data = JSON.stringify(character.s3Data).replace(/'/g, "''");
      
      return `INSERT INTO "Character" ("id", "s3Data", "createdAt", "updatedAt") VALUES ('${character.id}', '${escapedS3Data}'::json, '${character.createdAt.toISOString()}', '${character.updatedAt.toISOString()}');`;
    });

    // Write to file
    const fs = require('fs');
    const filename = `character-insert-statements-${new Date().toISOString().split('T')[0]}.sql`;
    
    const header = `-- Character table INSERT statements
-- Generated on: ${new Date().toISOString()}
-- Total records: ${characters.length}

-- Disable foreign key checks if needed
-- SET session_replication_role = replica;

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM "Character";

`;

    const footer = `
-- Re-enable foreign key checks if needed
-- SET session_replication_role = DEFAULT;

-- Verify the migration
-- SELECT COUNT(*) FROM "Character";
`;

    const content = header + insertStatements.join('\n') + footer;
    
    fs.writeFileSync(filename, content);
    console.log(`INSERT statements written to: ${filename}`);
    console.log(`Total statements generated: ${insertStatements.length}`);

    // Also generate a summary
    console.log('\n--- Migration Summary ---');
    console.log(`Source records: ${characters.length}`);
    console.log(`Date range: ${characters[0]?.createdAt.toISOString()} to ${characters[characters.length - 1]?.createdAt.toISOString()}`);
    
    // Show sample of IDs
    if (characters.length > 0) {
      console.log('Sample IDs:');
      characters.slice(0, 3).forEach(char => {
        console.log(`  - ${char.id}`);
      });
      if (characters.length > 3) {
        console.log(`  ... and ${characters.length - 3} more`);
      }
    }

  } catch (error) {
    console.error('Error generating INSERT statements:', error);
  } finally {
    await sourcePrisma.$disconnect();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'generate';

  if (mode === 'generate') {
    await generateInsertStatements();
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateInsertStatements }; 