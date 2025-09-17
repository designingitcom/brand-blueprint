/**
 * Smart Module Association System - Usage Examples
 * 
 * This file demonstrates how to use the module dependency system
 * in various scenarios within the brand management application.
 */

import {
  createDependencyManager,
  validateDependencyAddition,
  getModulePath,
  formatDependencyTree,
  ModuleNode,
  ModuleDependency,
  DependencyValidationResult
} from './module-dependencies';

// Example: Standard 21-module brand strategy setup
export function createBrandStrategyDependencies(): {
  modules: ModuleNode[];
  dependencies: ModuleDependency[];
} {
  const modules: ModuleNode[] = [
    // Foundation modules (must come first)
    {
      id: 'm1',
      code: 'M1-FOUNDATION',
      name: 'Brand Foundation',
      category: 'foundation',
      sort_order: 1,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm2',
      code: 'M2-RESEARCH',
      name: 'Market Research',
      category: 'foundation',
      sort_order: 2,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm20',
      code: 'M20-TEAM',
      name: 'Team Alignment',
      category: 'foundation',
      sort_order: 20,
      is_active: true,
      status: 'not_started'
    },
    
    // Strategy modules
    {
      id: 'm3',
      code: 'M3-AUDIENCE',
      name: 'Target Audience',
      category: 'strategy',
      sort_order: 3,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm4',
      code: 'M4-POSITIONING',
      name: 'Brand Positioning',
      category: 'strategy',
      sort_order: 4,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm5',
      code: 'M5-PERSONALITY',
      name: 'Brand Personality',
      category: 'strategy',
      sort_order: 5,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm18',
      code: 'M18-EVOLUTION',
      name: 'Brand Evolution Plan',
      category: 'strategy',
      sort_order: 18,
      is_active: true,
      status: 'not_started'
    },
    
    // Communication modules
    {
      id: 'm6',
      code: 'M6-VOICE',
      name: 'Brand Voice & Tone',
      category: 'communication',
      sort_order: 6,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm10',
      code: 'M10-CONTENT',
      name: 'Content Strategy',
      category: 'communication',
      sort_order: 10,
      is_active: true,
      status: 'not_started'
    },
    
    // Visual modules
    {
      id: 'm7',
      code: 'M7-VISUAL',
      name: 'Visual Identity System',
      category: 'visual',
      sort_order: 7,
      is_active: true,
      status: 'not_started'
    },
    {
      id: 'm8',
      code: 'M8-GUIDELINES',
      name: 'Brand Guidelines',
      category: 'visual',
      sort_order: 8,
      is_active: true,
      status: 'not_started'
    }
  ];

  const dependencies: ModuleDependency[] = [
    // Foundation dependencies
    {
      id: 'd1',
      module_id: 'm3',
      depends_on_module_id: 'm2',
      dependency_type: 'requires',
      notes: 'Market research informs target audience definition'
    },
    {
      id: 'd2',
      module_id: 'm4',
      depends_on_module_id: 'm1',
      dependency_type: 'requires',
      notes: 'Brand foundation is prerequisite for positioning'
    },
    {
      id: 'd3',
      module_id: 'm4',
      depends_on_module_id: 'm3',
      dependency_type: 'requires',
      notes: 'Need defined audience for effective positioning'
    },
    
    // Strategy to communication flow
    {
      id: 'd4',
      module_id: 'm5',
      depends_on_module_id: 'm4',
      dependency_type: 'requires',
      notes: 'Personality flows from positioning'
    },
    {
      id: 'd5',
      module_id: 'm6',
      depends_on_module_id: 'm5',
      dependency_type: 'requires',
      notes: 'Voice reflects brand personality'
    },
    
    // Visual identity dependencies
    {
      id: 'd6',
      module_id: 'm7',
      depends_on_module_id: 'm4',
      dependency_type: 'requires',
      notes: 'Visual identity must reflect positioning'
    },
    {
      id: 'd7',
      module_id: 'm7',
      depends_on_module_id: 'm5',
      dependency_type: 'requires',
      notes: 'Visual design expresses personality'
    },
    {
      id: 'd8',
      module_id: 'm8',
      depends_on_module_id: 'm7',
      dependency_type: 'requires',
      notes: 'Guidelines document the visual system'
    },
    
    // Content strategy dependencies
    {
      id: 'd9',
      module_id: 'm10',
      depends_on_module_id: 'm6',
      dependency_type: 'requires',
      notes: 'Content strategy needs defined voice'
    },
    {
      id: 'd10',
      module_id: 'm10',
      depends_on_module_id: 'm3',
      dependency_type: 'requires',
      notes: 'Content must target defined audience'
    },
    
    // Soft recommendations
    {
      id: 'd11',
      module_id: 'm18',
      depends_on_module_id: 'm1',
      dependency_type: 'recommends',
      notes: 'Evolution planning benefits from solid foundation'
    },
    {
      id: 'd12',
      module_id: 'm20',
      depends_on_module_id: 'm8',
      dependency_type: 'recommends',
      notes: 'Team alignment easier with documented guidelines'
    }
  ];

  return { modules, dependencies };
}

// Example: Validating a complete brand strategy setup
export function validateBrandStrategy(): {
  validation: DependencyValidationResult;
  suggestions: string[];
} {
  const { modules, dependencies } = createBrandStrategyDependencies();
  const manager = createDependencyManager(modules, dependencies);
  
  const validation = manager.validateDependencies();
  const suggestions: string[] = [];

  // Check optimal ordering
  const ordering = manager.getTopologicalOrder();
  if (ordering.orderedModules.length > 0) {
    suggestions.push(`Recommended module execution order:`);
    ordering.orderedModules.forEach((module, index) => {
      suggestions.push(`  ${index + 1}. ${module.name} (${module.code})`);
    });
  }

  // Identify initial modules
  const availableModules = manager.getAvailableModules();
  if (availableModules.length > 0) {
    suggestions.push(`\nModules that can be started immediately:`);
    availableModules.forEach(module => {
      suggestions.push(`  • ${module.name} - ${module.category}`);
    });
  }

  return { validation, suggestions };
}

// Example: Progressive project workflow
export function simulateProjectProgress(): {
  phases: Array<{
    phase: string;
    completed: string[];
    available: string[];
    suggested: string[];
    blockedCount: number;
  }>;
} {
  const { modules, dependencies } = createBrandStrategyDependencies();
  const manager = createDependencyManager(modules, dependencies);
  
  const phases = [];
  let completed: string[] = [];

  // Phase 1: Foundation phase
  const phase1Available = manager.getAvailableModules(completed);
  const phase1Suggested = manager.suggestNextModules(completed, [], 3);
  
  phases.push({
    phase: 'Foundation Phase',
    completed: [...completed],
    available: phase1Available.map(m => m.name),
    suggested: phase1Suggested.map(m => m.name),
    blockedCount: modules.length - phase1Available.length
  });

  // Complete foundation modules
  completed = ['m1', 'm2'];

  // Phase 2: Strategy phase
  const phase2Available = manager.getAvailableModules(completed);
  const phase2Suggested = manager.suggestNextModules(completed, [], 3);
  
  phases.push({
    phase: 'Strategy Development Phase',
    completed: [...completed],
    available: phase2Available.map(m => m.name),
    suggested: phase2Suggested.map(m => m.name),
    blockedCount: modules.length - phase2Available.length
  });

  // Complete strategy modules
  completed = ['m1', 'm2', 'm3', 'm4', 'm5'];

  // Phase 3: Implementation phase
  const phase3Available = manager.getAvailableModules(completed);
  const phase3Suggested = manager.suggestNextModules(completed, [], 3);
  
  phases.push({
    phase: 'Implementation Phase',
    completed: [...completed],
    available: phase3Available.map(m => m.name),
    suggested: phase3Suggested.map(m => m.name),
    blockedCount: modules.length - phase3Available.length
  });

  return { phases };
}

// Example: Custom dependency validation for client-specific needs
export function validateCustomBrandSetup(
  customModules: ModuleNode[],
  customDependencies: ModuleDependency[]
): {
  validation: DependencyValidationResult;
  recommendations: string[];
  criticalPath: string[];
} {
  const manager = createDependencyManager(customModules, customDependencies);
  const validation = manager.validateDependencies();
  const recommendations: string[] = [];
  
  // Generate recommendations based on validation results
  if (!validation.isValid) {
    recommendations.push('❌ CRITICAL ISSUES FOUND:');
    validation.errors.forEach(error => {
      recommendations.push(`  • ${error.message}`);
    });
  }

  if (validation.warnings.length > 0) {
    recommendations.push('\n⚠️ OPTIMIZATION OPPORTUNITIES:');
    validation.warnings.forEach(warning => {
      recommendations.push(`  • ${warning.message}`);
      if (warning.suggestion) {
        recommendations.push(`    → ${warning.suggestion}`);
      }
    });
  }

  if (validation.suggestions.length > 0) {
    recommendations.push('\n💡 SUGGESTIONS FOR IMPROVEMENT:');
    validation.suggestions.forEach(suggestion => {
      recommendations.push(`  • ${suggestion.message}`);
      recommendations.push(`    Action: ${suggestion.action}`);
      recommendations.push(`    Priority: ${suggestion.priority}`);
    });
  }

  // Find critical path (longest dependency chain)
  const ordering = manager.getTopologicalOrder();
  const criticalPath = ordering.orderedModules
    .slice(0, 5) // Top 5 modules in critical path
    .map(m => `${m.name} (${m.code})`);

  return { validation, recommendations, criticalPath };
}

// Example: Dynamic dependency adjustment
export function addNewModuleDependency(
  currentModules: ModuleNode[],
  currentDependencies: ModuleDependency[],
  moduleId: string,
  dependsOnModuleId: string,
  dependencyType: 'requires' | 'recommends' | 'blocks' = 'requires'
): {
  isValid: boolean;
  errors: string[];
  updatedDependencies: ModuleDependency[];
} {
  const newDependency = {
    module_id: moduleId,
    depends_on_module_id: dependsOnModuleId,
    dependency_type: dependencyType
  };

  const validation = validateDependencyAddition(
    currentModules,
    currentDependencies,
    newDependency
  );

  if (validation.isValid) {
    return {
      isValid: true,
      errors: [],
      updatedDependencies: [
        ...currentDependencies,
        { ...newDependency, id: `dep-${Date.now()}` }
      ]
    };
  } else {
    return {
      isValid: false,
      errors: validation.errors.map(e => e.message),
      updatedDependencies: currentDependencies
    };
  }
}

// Example: Dependency tree visualization
export function generateDependencyReport(
  modules: ModuleNode[],
  dependencies: ModuleDependency[]
): string {
  const manager = createDependencyManager(modules, dependencies);
  const validation = manager.validateDependencies();
  const ordering = manager.getTopologicalOrder();
  const tree = manager.buildDependencyTree();
  
  let report = '';
  
  // Header
  report += '='.repeat(60) + '\n';
  report += '       BRAND STRATEGY MODULE DEPENDENCY REPORT\n';
  report += '='.repeat(60) + '\n\n';

  // Validation summary
  report += '📊 VALIDATION SUMMARY\n';
  report += '-'.repeat(20) + '\n';
  report += `Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
  report += `Errors: ${validation.errors.length}\n`;
  report += `Warnings: ${validation.warnings.length}\n`;
  report += `Suggestions: ${validation.suggestions.length}\n\n`;

  // Errors
  if (validation.errors.length > 0) {
    report += '❌ ERRORS\n';
    report += '-'.repeat(10) + '\n';
    validation.errors.forEach(error => {
      report += `• ${error.message}\n`;
    });
    report += '\n';
  }

  // Optimal order
  report += '📋 RECOMMENDED EXECUTION ORDER\n';
  report += '-'.repeat(30) + '\n';
  ordering.orderedModules.forEach((module, index) => {
    report += `${String(index + 1).padStart(2)}. ${module.name} (${module.code})\n`;
  });
  report += '\n';

  // Dependency tree
  report += '🌳 DEPENDENCY TREE STRUCTURE\n';
  report += '-'.repeat(30) + '\n';
  report += formatDependencyTree(tree);
  report += '\n';

  // Available modules
  const available = manager.getAvailableModules();
  report += '🚀 READY TO START\n';
  report += '-'.repeat(17) + '\n';
  if (available.length === 0) {
    report += 'No modules available (check dependencies)\n';
  } else {
    available.forEach(module => {
      report += `• ${module.name} - ${module.category}\n`;
    });
  }

  return report;
}

// Example usage demonstrations
export function demonstrateUsage() {
  console.log('🎯 Brand Strategy Module Dependency System Demo\n');

  // 1. Basic validation
  console.log('1. Validating brand strategy setup...');
  const { validation, suggestions } = validateBrandStrategy();
  console.log(`   Validation result: ${validation.isValid ? 'VALID' : 'INVALID'}`);
  console.log(`   Issues found: ${validation.errors.length} errors, ${validation.warnings.length} warnings\n`);

  // 2. Project progression simulation
  console.log('2. Simulating project phases...');
  const { phases } = simulateProjectProgress();
  phases.forEach((phase, index) => {
    console.log(`   Phase ${index + 1} - ${phase.phase}:`);
    console.log(`     Completed: ${phase.completed.length} modules`);
    console.log(`     Available: ${phase.available.length} modules`);
    console.log(`     Blocked: ${phase.blockedCount} modules`);
  });

  // 3. Generate full report
  console.log('\n3. Generating dependency report...');
  const { modules, dependencies } = createBrandStrategyDependencies();
  const report = generateDependencyReport(modules, dependencies);
  console.log('   Report generated successfully!');
  
  return {
    validation,
    phases,
    report
  };
}