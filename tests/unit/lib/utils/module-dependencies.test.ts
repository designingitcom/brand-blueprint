import { describe, it, expect, beforeEach } from 'vitest';
import {
  ModuleDependencyManager,
  createDependencyManager,
  validateDependencyAddition,
  getModulePath,
  formatDependencyTree,
  ModuleNode,
  ModuleDependency,
  DependencyValidationResult
} from '@/lib/utils/module-dependencies';

// Test data setup
const createTestModules = (): ModuleNode[] => [
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
    code: 'M5-VISUAL',
    name: 'Visual Identity',
    category: 'visual',
    sort_order: 5,
    is_active: true,
    status: 'not_started'
  }
];

const createTestDependencies = (): ModuleDependency[] => [
  {
    id: 'd1',
    module_id: 'm3',
    depends_on_module_id: 'm2',
    dependency_type: 'requires',
    notes: 'Need market research before defining audience'
  },
  {
    id: 'd2',
    module_id: 'm4',
    depends_on_module_id: 'm1',
    dependency_type: 'requires',
    notes: 'Brand foundation required for positioning'
  },
  {
    id: 'd3',
    module_id: 'm4',
    depends_on_module_id: 'm3',
    dependency_type: 'requires',
    notes: 'Need to know audience for positioning'
  },
  {
    id: 'd4',
    module_id: 'm5',
    depends_on_module_id: 'm4',
    dependency_type: 'requires',
    notes: 'Visual identity follows from positioning'
  },
  {
    id: 'd5',
    module_id: 'm5',
    depends_on_module_id: 'm1',
    dependency_type: 'recommends',
    notes: 'Visual should reflect brand foundation'
  }
];

describe('ModuleDependencyManager', () => {
  let manager: ModuleDependencyManager;
  let modules: ModuleNode[];
  let dependencies: ModuleDependency[];

  beforeEach(() => {
    modules = createTestModules();
    dependencies = createTestDependencies();
    manager = new ModuleDependencyManager(modules, dependencies);
  });

  describe('constructor and basic functionality', () => {
    it('should create manager with modules and dependencies', () => {
      expect(manager).toBeDefined();
    });

    it('should validate valid dependency structure', () => {
      const validation = manager.validateDependencies();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('circular dependency detection', () => {
    it('should detect simple circular dependency', () => {
      const circularDeps: ModuleDependency[] = [
        ...dependencies,
        {
          id: 'circular',
          module_id: 'm1',
          depends_on_module_id: 'm4',
          dependency_type: 'requires'
        }
      ];

      const circularManager = new ModuleDependencyManager(modules, circularDeps);
      const validation = circularManager.validateDependencies();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.type === 'circular_dependency')).toBe(true);
    });

    it('should detect complex circular dependency chain', () => {
      const circularDeps: ModuleDependency[] = [
        {
          id: 'c1',
          module_id: 'm1',
          depends_on_module_id: 'm2',
          dependency_type: 'requires'
        },
        {
          id: 'c2',
          module_id: 'm2',
          depends_on_module_id: 'm3',
          dependency_type: 'requires'
        },
        {
          id: 'c3',
          module_id: 'm3',
          depends_on_module_id: 'm1',
          dependency_type: 'requires'
        }
      ];

      const circularManager = new ModuleDependencyManager(modules, circularDeps);
      const validation = circularManager.validateDependencies();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.type === 'circular_dependency')).toBe(true);
      const circularError = validation.errors.find(e => e.type === 'circular_dependency');
      expect(circularError?.moduleIds).toContain('m1');
      expect(circularError?.moduleIds).toContain('m2');
      expect(circularError?.moduleIds).toContain('m3');
    });
  });

  describe('missing prerequisite detection', () => {
    it('should detect missing prerequisite module', () => {
      const invalidDeps: ModuleDependency[] = [
        ...dependencies,
        {
          id: 'invalid',
          module_id: 'm1',
          depends_on_module_id: 'nonexistent',
          dependency_type: 'requires'
        }
      ];

      const invalidManager = new ModuleDependencyManager(modules, invalidDeps);
      const validation = invalidManager.validateDependencies();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.type === 'missing_prerequisite')).toBe(true);
    });
  });

  describe('self-reference detection', () => {
    it('should detect self-referencing dependency', () => {
      const selfRefDeps: ModuleDependency[] = [
        ...dependencies,
        {
          id: 'self',
          module_id: 'm1',
          depends_on_module_id: 'm1',
          dependency_type: 'requires'
        }
      ];

      const selfRefManager = new ModuleDependencyManager(modules, selfRefDeps);
      const validation = selfRefManager.validateDependencies();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.type === 'self_reference')).toBe(true);
    });
  });

  describe('topological ordering', () => {
    it('should produce valid topological order', () => {
      const ordering = manager.getTopologicalOrder();
      
      expect(ordering.orderedModules).toHaveLength(modules.length);
      expect(ordering.errors).toHaveLength(0);
      
      // Verify dependencies are respected
      const modulePositions = new Map(
        ordering.orderedModules.map((module, index) => [module.id, index])
      );

      // m2 should come before m3 (m3 depends on m2)
      expect(modulePositions.get('m2')).toBeLessThan(modulePositions.get('m3')!);
      
      // m1 should come before m4 (m4 depends on m1)
      expect(modulePositions.get('m1')).toBeLessThan(modulePositions.get('m4')!);
      
      // m3 should come before m4 (m4 depends on m3)
      expect(modulePositions.get('m3')).toBeLessThan(modulePositions.get('m4')!);
      
      // m4 should come before m5 (m5 depends on m4)
      expect(modulePositions.get('m4')).toBeLessThan(modulePositions.get('m5')!);
    });

    it('should handle modules with no dependencies', () => {
      const simpleDeps: ModuleDependency[] = [
        {
          id: 'd1',
          module_id: 'm2',
          depends_on_module_id: 'm1',
          dependency_type: 'requires'
        }
      ];

      const simpleManager = new ModuleDependencyManager(modules, simpleDeps);
      const ordering = simpleManager.getTopologicalOrder();

      expect(ordering.orderedModules).toHaveLength(modules.length);
      
      const modulePositions = new Map(
        ordering.orderedModules.map((module, index) => [module.id, index])
      );
      
      expect(modulePositions.get('m1')).toBeLessThan(modulePositions.get('m2')!);
    });
  });

  describe('module availability checking', () => {
    it('should identify available modules correctly', () => {
      const availableModules = manager.getAvailableModules();
      
      // m1 and m2 should be available (no dependencies)
      const availableIds = availableModules.map(m => m.id);
      expect(availableIds).toContain('m1');
      expect(availableIds).toContain('m2');
      expect(availableIds).not.toContain('m3'); // depends on m2
      expect(availableIds).not.toContain('m4'); // depends on m1 and m3
      expect(availableIds).not.toContain('m5'); // depends on m4
    });

    it('should respect completed modules when determining availability', () => {
      const completedModules = ['m1', 'm2'];
      const availableModules = manager.getAvailableModules(completedModules);
      
      const availableIds = availableModules.map(m => m.id);
      expect(availableIds).toContain('m3'); // m2 completed, so m3 available
      expect(availableIds).not.toContain('m4'); // still needs m3
      expect(availableIds).not.toContain('m5'); // still needs m4
    });

    it('should check prerequisites correctly', () => {
      expect(manager.arePrerequisitesMet('m1')).toBe(true); // no prerequisites
      expect(manager.arePrerequisitesMet('m2')).toBe(true); // no prerequisites
      expect(manager.arePrerequisitesMet('m3')).toBe(false); // depends on m2
      
      const completedSet = new Set(['m1', 'm2']);
      expect(manager.arePrerequisitesMet('m3', completedSet)).toBe(true);
      expect(manager.arePrerequisitesMet('m4', completedSet)).toBe(false); // needs m3 too
    });
  });

  describe('dependency tree building', () => {
    it('should build correct dependency tree structure', () => {
      const tree = manager.buildDependencyTree();
      
      expect(tree).toBeDefined();
      expect(tree.length).toBeGreaterThan(0);
      
      // Root nodes should have no dependencies
      tree.forEach(rootNode => {
        expect(rootNode.dependencies).toHaveLength(0);
        expect(rootNode.depth).toBe(0);
      });
    });

    it('should calculate depths correctly', () => {
      const tree = manager.buildDependencyTree();
      
      // Find specific nodes and check their depths
      const findNodeById = (nodes: any[], id: string): any => {
        for (const node of nodes) {
          if (node.module.id === id) return node;
          const found = findNodeById(node.dependents, id);
          if (found) return found;
        }
        return null;
      };

      // m1 and m2 should be at depth 0 (roots)
      const m1Node = findNodeById(tree, 'm1');
      const m2Node = findNodeById(tree, 'm2');
      expect(m1Node?.depth).toBe(0);
      expect(m2Node?.depth).toBe(0);
    });
  });

  describe('suggestion system', () => {
    it('should suggest next modules correctly', () => {
      const suggestions = manager.suggestNextModules([], [], 2);
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions.map(s => s.id)).toContain('m1');
      expect(suggestions.map(s => s.id)).toContain('m2');
    });

    it('should respect in-progress modules in suggestions', () => {
      const suggestions = manager.suggestNextModules([], ['m1'], 3);
      
      const suggestionIds = suggestions.map(s => s.id);
      expect(suggestionIds).not.toContain('m1'); // already in progress
      expect(suggestionIds).toContain('m2');
    });

    it('should suggest modules that become available after completions', () => {
      const suggestions = manager.suggestNextModules(['m1', 'm2'], [], 2);
      
      const suggestionIds = suggestions.map(s => s.id);
      expect(suggestionIds).toContain('m3'); // becomes available when m2 is completed
    });
  });

  describe('ordering issue detection', () => {
    it('should detect suboptimal module ordering', () => {
      // Create modules with suboptimal sort_order
      const badOrderModules: ModuleNode[] = [
        { ...modules[0], sort_order: 5 }, // m1 at position 5
        { ...modules[1], sort_order: 1 }, // m2 at position 1
        { ...modules[2], sort_order: 2 }, // m3 at position 2 (but depends on m2)
        { ...modules[3], sort_order: 3 }, // m4 at position 3
        { ...modules[4], sort_order: 4 }  // m5 at position 4
      ];

      const badManager = new ModuleDependencyManager(badOrderModules, dependencies);
      const validation = badManager.validateDependencies();

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.type === 'suboptimal_order')).toBe(true);
    });
  });
});

describe('utility functions', () => {
  let modules: ModuleNode[];
  let dependencies: ModuleDependency[];

  beforeEach(() => {
    modules = createTestModules();
    dependencies = createTestDependencies();
  });

  describe('createDependencyManager', () => {
    it('should create a dependency manager instance', () => {
      const manager = createDependencyManager(modules, dependencies);
      expect(manager).toBeInstanceOf(ModuleDependencyManager);
    });
  });

  describe('validateDependencyAddition', () => {
    it('should validate valid dependency addition', () => {
      const newDep = {
        module_id: 'm1',
        depends_on_module_id: 'm2',
        dependency_type: 'recommends' as const
      };

      const validation = validateDependencyAddition(modules, dependencies, newDep);
      expect(validation.isValid).toBe(true);
    });

    it('should detect circular dependency in new addition', () => {
      const newDep = {
        module_id: 'm1',
        depends_on_module_id: 'm5', // would create cycle m1->m5->m4->m1
        dependency_type: 'requires' as const
      };

      const validation = validateDependencyAddition(modules, dependencies, newDep);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.type === 'circular_dependency')).toBe(true);
    });
  });

  describe('getModulePath', () => {
    it('should return correct module path', () => {
      const path = getModulePath(modules, dependencies, 'm5');
      expect(path).toBeDefined();
      expect(path.length).toBeGreaterThan(0);
    });
  });

  describe('formatDependencyTree', () => {
    it('should format tree as readable string', () => {
      const manager = createDependencyManager(modules, dependencies);
      const tree = manager.buildDependencyTree();
      const formatted = formatDependencyTree(tree);
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
      expect(formatted).toContain('Brand Foundation');
      expect(formatted).toContain('✅'); // should contain status indicators
    });
  });
});

describe('edge cases and error handling', () => {
  it('should handle empty modules and dependencies', () => {
    const manager = new ModuleDependencyManager([], []);
    const validation = manager.validateDependencies();
    
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    expect(validation.warnings).toHaveLength(0);
  });

  it('should handle modules with no dependencies', () => {
    const modules = createTestModules();
    const manager = new ModuleDependencyManager(modules, []);
    
    const availableModules = manager.getAvailableModules();
    expect(availableModules).toHaveLength(modules.length);
    
    const ordering = manager.getTopologicalOrder();
    expect(ordering.orderedModules).toHaveLength(modules.length);
  });

  it('should handle complex dependency chains', () => {
    const modules = createTestModules();
    
    // Create a long chain of dependencies
    const longChainDeps: ModuleDependency[] = [
      {
        id: 'd1',
        module_id: 'm2',
        depends_on_module_id: 'm1',
        dependency_type: 'requires'
      },
      {
        id: 'd2',
        module_id: 'm3',
        depends_on_module_id: 'm2',
        dependency_type: 'requires'
      },
      {
        id: 'd3',
        module_id: 'm4',
        depends_on_module_id: 'm3',
        dependency_type: 'requires'
      },
      {
        id: 'd4',
        module_id: 'm5',
        depends_on_module_id: 'm4',
        dependency_type: 'requires'
      }
    ];

    const manager = new ModuleDependencyManager(modules, longChainDeps);
    const validation = manager.validateDependencies();
    
    expect(validation.isValid).toBe(true);
    
    const ordering = manager.getTopologicalOrder();
    expect(ordering.orderedModules).toEqual([
      expect.objectContaining({ id: 'm1' }),
      expect.objectContaining({ id: 'm2' }),
      expect.objectContaining({ id: 'm3' }),
      expect.objectContaining({ id: 'm4' }),
      expect.objectContaining({ id: 'm5' })
    ]);
  });

  it('should handle recommendation vs requirement dependencies differently', () => {
    const modules = createTestModules();
    const mixedDeps: ModuleDependency[] = [
      {
        id: 'd1',
        module_id: 'm2',
        depends_on_module_id: 'm1',
        dependency_type: 'requires'
      },
      {
        id: 'd2',
        module_id: 'm3',
        depends_on_module_id: 'm1',
        dependency_type: 'recommends' // soft dependency
      }
    ];

    const manager = new ModuleDependencyManager(modules, mixedDeps);
    
    // Both m2 and m3 should be available when no modules are completed
    // (m3 has only a recommendation, not a requirement)
    const available = manager.getAvailableModules();
    const availableIds = available.map(m => m.id);
    
    expect(availableIds).toContain('m1');
    expect(availableIds).not.toContain('m2'); // requires m1
    expect(availableIds).toContain('m3'); // only recommends m1
    expect(availableIds).toContain('m4');
    expect(availableIds).toContain('m5');
  });
});