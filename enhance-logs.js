const fs = require('fs');
let file = fs.readFileSync('src/app/api/groups/route.ts', 'utf8');

const oldStr =   } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  };

const newStr =   } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error?.message || String(error) }, { status: 500 });
  };

file = file.replace(oldStr, newStr);
fs.writeFileSync('src/app/api/groups/route.ts', file);
console.log('done');
