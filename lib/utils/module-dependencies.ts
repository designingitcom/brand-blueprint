/**
 * Smart Module Association System for Strategy Dependencies
 * 
 * This utility provides comprehensive module dependency management including:
 * - Prerequisite validation
 * - Smart ordering with topological sorting
 * - Circular dependency detection
 * - Visual dependency tree representation
 * - Module availability checking
 * - Auto-suggestions for optimal ordering
 */

// Types based on existing schema
export type DependencyType = 'requires' | 'recommends' | 'blocks';
export type ModuleStatus = 'not_started' | 'in_progress' | 'needs_review' | 'approved' | 'locked';

export interface ModuleNode {
  id: string;
  code: string;
  name: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  status?: ModuleStatus;
}

export interface ModuleDependency {
  id: string;
  module_id: string;
  depends_on_module_id: string;
  dependency_type: DependencyType;
  notes?: string;
}

export interface DependencyValidationResult {
  isValid: boolean;
  errors: DependencyError[];
  warnings: DependencyWarning[];
  suggestions: DependencySuggestion[];
}

export interface DependencyError {
  type: 'circular_dependency' | 'missing_prerequisite' | 'invalid_dependency' | 'self_reference';
  message: string;
  moduleIds: string[];
  severity: 'error' | 'warning';
}

export interface DependencyWarning {
  type: 'suboptimal_order' | 'unused_dependency' | 'weak_dependency';
  message: string;
  moduleIds: string[];
  suggestion?: string;
}

export interface DependencySuggestion {
  type: 'reorder' | 'add_dependency' | 'remove_dependency' | 'change_type';
  message: string;
  moduleIds: string[];
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DependencyTreeNode {
  module: ModuleNode;
  dependencies: DependencyTreeNode[];
  dependents: DependencyTreeNode[];
  depth: number;
  path: string[];
  isAvailable: boolean;
  prerequisitesMet: boolean;
}

export interface ModuleOrderingResult {
  orderedModules: ModuleNode[];
  errors: DependencyError[];
  warnings: DependencyWarning[];
  suggestions: DependencySuggestion[];
  dependencyTree: DependencyTreeNode[];
}

/**
 * Core dependency validation and management class
 */
export class ModuleDependencyManager {
  private modules: Map<string, ModuleNode> = new Map();
  private dependencies: Map<string, ModuleDependency[]> = new Map();
  private reverseDependencies: Map<string, ModuleDependency[]> = new Map();

  constructor(modules: ModuleNode[], dependencies: ModuleDependency[]) {
    this.loadModules(modules);
    this.loadDependencies(dependencies);
  }

  private loadModules(modules: ModuleNode[]) {
    this.modules.clear();
    modules.forEach(module => {
      this.modules.set(module.id, module);
    });
  }

  private loadDependencies(dependencies: ModuleDependency[]) {
    this.dependencies.clear();
    this.reverseDependencies.clear();
    
    dependencies.forEach(dep => {
      // Forward dependencies (what this module depends on)
      if (!this.dependencies.has(dep.module_id)) {
        this.dependencies.set(dep.module_id, []);
      }
      this.dependencies.get(dep.module_id)!.push(dep);

      // Reverse dependencies (what depends on this module)
      if (!this.reverseDependencies.has(dep.depends_on_module_id)) {
        this.reverseDependencies.set(dep.depends_on_module_id, []);
      }
      this.reverseDependencies.get(dep.depends_on_module_id)!.push(dep);
    });
  }

  /**
   * Validates all dependencies and returns comprehensive results
   */
  validateDependencies(): DependencyValidationResult {
    const errors: DependencyError[] = [];
    const warnings: DependencyWarning[] = [];
    const suggestions: DependencySuggestion[] = [];

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies();
    errors.push(...circularDeps);

    // Check for missing prerequisites
    const missingPrereqs = this.detectMissingPrerequisites();
    errors.push(...missingPrereqs);

    // Check for self-references
    const selfRefs = this.detectSelfReferences();
    errors.push(...selfRefs);

    // Check for suboptimal ordering
    const orderingIssues = this.detectOrderingIssues();
    warnings.push(...orderingIssues);

    // Generate suggestions
    const optimizationSuggestions = this.generateOptimizationSuggestions();
    suggestions.push(...optimizationSuggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Detects circular dependencies using DFS
   */
  private detectCircularDependencies(): DependencyError[] {
    const errors: DependencyError[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    for (const moduleId of Array.from(this.modules.keys())) {
      if (!visited.has(moduleId)) {
        const cycle = this.dfsCircularDetection(moduleId, visited, recursionStack, path);
        if (cycle.length > 0) {
          errors.push({
            type: 'circular_dependency',
            message: `Circular dependency detected: ${cycle.map(id => this.modules.get(id)?.name || id).join(' → ')} → ${this.modules.get(cycle[0])?.name || cycle[0]}`,
            moduleIds: cycle,
            severity: 'error'
          });
        }
      }
    }

    return errors;
  }

  private dfsCircularDetection(
    moduleId: string, 
    visited: Set<string>, 
    recursionStack: Set<string>, 
    path: string[]
  ): string[] {
    visited.add(moduleId);
    recursionStack.add(moduleId);
    path.push(moduleId);

    const dependencies = this.dependencies.get(moduleId) || [];
    
    for (const dep of dependencies) {
      const dependsOnId = dep.depends_on_module_id;
      
      if (!visited.has(dependsOnId)) {
        const cycle = this.dfsCircularDetection(dependsOnId, visited, recursionStack, [...path]);
        if (cycle.length > 0) return cycle;
      } else if (recursionStack.has(dependsOnId)) {
        // Found cycle - return path from cycle start
        const cycleStartIndex = path.indexOf(dependsOnId);
        return path.slice(cycleStartIndex);
      }
    }

    recursionStack.delete(moduleId);
    path.pop();
    return [];
  }

  /**
   * Detects missing prerequisites
   */
  private detectMissingPrerequisites(): DependencyError[] {
    const errors: DependencyError[] = [];

    for (const [moduleId, deps] of Array.from(this.dependencies.entries())) {
      for (const dep of deps) {
        if (!this.modules.has(dep.depends_on_module_id)) {
          const module = this.modules.get(moduleId);
          errors.push({
            type: 'missing_prerequisite',
            message: `Module "${module?.name || moduleId}" depends on non-existent module "${dep.depends_on_module_id}"`,
            moduleIds: [moduleId, dep.depends_on_module_id],
            severity: 'error'
          });
        }
      }
    }

    return errors;
  }

  /**
   * Detects self-references
   */
  private detectSelfReferences(): DependencyError[] {
    const errors: DependencyError[] = [];

    for (const [moduleId, deps] of Array.from(this.dependencies.entries())) {
      for (const dep of deps) {
        if (dep.module_id === dep.depends_on_module_id) {
          const module = this.modules.get(moduleId);
          errors.push({
            type: 'self_reference',
            message: `Module "${module?.name || moduleId}" cannot depend on itself`,
            moduleIds: [moduleId],
            severity: 'error'
          });
        }
      }
    }

    return errors;
  }

  /**
   * Detects ordering issues
   */
  private detectOrderingIssues(): DependencyWarning[] {
    const warnings: DependencyWarning[] = [];
    const moduleArray = Array.from(this.modules.values()).sort((a, b) => a.sort_order - b.sort_order);

    for (let i = 0; i < moduleArray.length; i++) {
      const module = moduleArray[i];
      const deps = this.dependencies.get(module.id) || [];

      for (const dep of deps) {
        const dependsOnModule = this.modules.get(dep.depends_on_module_id);
        if (dependsOnModule && dependsOnModule.sort_order > module.sort_order) {
          warnings.push({
            type: 'suboptimal_order',
            message: `Module "${module.name}" (order ${module.sort_order}) depends on "${dependsOnModule.name}" (order ${dependsOnModule.sort_order}) which comes later`,
            moduleIds: [module.id, dependsOnModule.id],
            suggestion: `Move "${dependsOnModule.name}" before "${module.name}" in the ordering`
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Generates optimization suggestions
   */
  private generateOptimizationSuggestions(): DependencySuggestion[] {
    const suggestions: DependencySuggestion[] = [];

    // Suggest topological ordering
    const topologicalOrder = this.getTopologicalOrder();
    if (topologicalOrder.orderedModules.length > 0) {
      const currentOrder = Array.from(this.modules.values()).sort((a, b) => a.sort_order - b.sort_order);
      const isOptimal = this.isOrderOptimal(currentOrder, topologicalOrder.orderedModules);
      
      if (!isOptimal) {
        suggestions.push({
          type: 'reorder',
          message: 'Consider reordering modules to follow dependency relationships more closely',
          moduleIds: topologicalOrder.orderedModules.map(m => m.id),
          action: 'Apply suggested topological ordering',
          priority: 'medium'
        });
      }
    }

    // Suggest removing unnecessary dependencies
    const unusedDeps = this.findUnusedDependencies();
    for (const dep of unusedDeps) {
      suggestions.push({
        type: 'remove_dependency',
        message: `Consider removing unnecessary "${dep.dependency_type}" dependency`,
        moduleIds: [dep.module_id, dep.depends_on_module_id],
        action: `Remove dependency from ${this.modules.get(dep.module_id)?.name} to ${this.modules.get(dep.depends_on_module_id)?.name}`,
        priority: 'low'
      });
    }

    return suggestions;
  }

  /**
   * Performs topological sort to get optimal ordering
   */
  getTopologicalOrder(): ModuleOrderingResult {
    const errors: DependencyError[] = [];
    const warnings: DependencyWarning[] = [];
    const suggestions: DependencySuggestion[] = [];
    
    // First check for cycles - topological sort won't work with cycles
    const cycles = this.detectCircularDependencies();
    if (cycles.length > 0) {
      return {
        orderedModules: [],
        errors: cycles,
        warnings,
        suggestions,
        dependencyTree: []
      };
    }

    const orderedModules: ModuleNode[] = [];
    const visited = new Set<string>();
    const temporary = new Set<string>();

    // Kahn's algorithm for topological sorting
    const inDegree = new Map<string, number>();
    const queue: string[] = [];

    // Initialize in-degree count
    for (const moduleId of Array.from(this.modules.keys())) {
      inDegree.set(moduleId, 0);
    }

    // Calculate in-degrees
    for (const deps of Array.from(this.dependencies.values())) {
      for (const dep of deps) {
        if (dep.dependency_type === 'requires') { // Only consider hard dependencies
          const current = inDegree.get(dep.depends_on_module_id) || 0;
          inDegree.set(dep.depends_on_module_id, current + 1);
        }
      }
    }

    // Find nodes with no incoming edges
    for (const [moduleId, degree] of Array.from(inDegree.entries())) {
      if (degree === 0) {
        queue.push(moduleId);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const moduleId = queue.shift()!;
      const module = this.modules.get(moduleId);
      if (module) {
        orderedModules.push(module);
      }

      // Reduce in-degree for dependent modules
      const deps = this.dependencies.get(moduleId) || [];
      for (const dep of deps) {
        if (dep.dependency_type === 'requires') {
          const currentDegree = inDegree.get(dep.depends_on_module_id) || 0;
          const newDegree = currentDegree - 1;
          inDegree.set(dep.depends_on_module_id, newDegree);
          
          if (newDegree === 0) {
            queue.push(dep.depends_on_module_id);
          }
        }
      }
    }

    // Add remaining modules (those only connected by soft dependencies)
    for (const module of Array.from(this.modules.values())) {
      if (!orderedModules.find(m => m.id === module.id)) {
        orderedModules.push(module);
      }
    }

    const dependencyTree = this.buildDependencyTree();

    return {
      orderedModules,
      errors,
      warnings,
      suggestions,
      dependencyTree
    };
  }

  /**
   * Builds a visual dependency tree representation
   */
  buildDependencyTree(): DependencyTreeNode[] {
    const treeNodes: Map<string, DependencyTreeNode> = new Map();
    const visited = new Set<string>();

    // Create tree nodes
    for (const module of Array.from(this.modules.values())) {
      treeNodes.set(module.id, {
        module,
        dependencies: [],
        dependents: [],
        depth: 0,
        path: [],
        isAvailable: this.isModuleAvailable(module.id),
        prerequisitesMet: this.arePrerequisitesMet(module.id)
      });
    }

    // Build relationships
    for (const [moduleId, deps] of Array.from(this.dependencies.entries())) {
      const node = treeNodes.get(moduleId);
      if (!node) continue;

      for (const dep of deps) {
        const depNode = treeNodes.get(dep.depends_on_module_id);
        if (depNode) {
          node.dependencies.push(depNode);
          depNode.dependents.push(node);
        }
      }
    }

    // Calculate depths using BFS
    const queue: { nodeId: string; depth: number; path: string[] }[] = [];
    
    // Start with modules that have no dependencies
    for (const [moduleId, node] of Array.from(treeNodes.entries())) {
      if (node.dependencies.length === 0) {
        queue.push({ nodeId: moduleId, depth: 0, path: [] });
      }
    }

    while (queue.length > 0) {
      const { nodeId, depth, path } = queue.shift()!;
      const node = treeNodes.get(nodeId);
      if (!node || visited.has(nodeId)) continue;

      visited.add(nodeId);
      node.depth = depth;
      node.path = [...path, nodeId];

      // Add dependents to queue
      for (const dependent of node.dependents) {
        if (!visited.has(dependent.module.id)) {
          queue.push({ 
            nodeId: dependent.module.id, 
            depth: depth + 1, 
            path: [...path, nodeId] 
          });
        }
      }
    }

    // Return root nodes (those with no dependencies)
    return Array.from(treeNodes.values()).filter(node => node.dependencies.length === 0);
  }

  /**
   * Checks if a module is available for use
   */
  isModuleAvailable(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;
    
    return module.is_active && this.arePrerequisitesMet(moduleId);
  }

  /**
   * Checks if all prerequisites for a module are met
   */
  arePrerequisitesMet(moduleId: string, completedModules: Set<string> = new Set()): boolean {
    const deps = this.dependencies.get(moduleId) || [];
    
    for (const dep of deps) {
      if (dep.dependency_type === 'requires') {
        const prerequisite = this.modules.get(dep.depends_on_module_id);
        if (!prerequisite) return false;
        
        // Check if prerequisite is completed or available
        if (!completedModules.has(dep.depends_on_module_id)) {
          const prerequisiteStatus = prerequisite.status;
          if (prerequisiteStatus !== 'approved' && prerequisiteStatus !== 'locked') {
            return false;
          }
        }
        
        // Recursively check prerequisite's prerequisites
        if (!this.arePrerequisitesMet(dep.depends_on_module_id, completedModules)) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Gets available modules that can be started given current project state
   */
  getAvailableModules(completedModuleIds: string[] = []): ModuleNode[] {
    const completed = new Set(completedModuleIds);
    const available: ModuleNode[] = [];

    for (const module of Array.from(this.modules.values())) {
      if (module.is_active && !completed.has(module.id)) {
        if (this.arePrerequisitesMet(module.id, completed)) {
          available.push(module);
        }
      }
    }

    return available.sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Suggests next modules to work on
   */
  suggestNextModules(
    completedModuleIds: string[] = [], 
    inProgressModuleIds: string[] = [],
    maxSuggestions: number = 3
  ): ModuleNode[] {
    const completed = new Set(completedModuleIds);
    const inProgress = new Set(inProgressModuleIds);
    const available = this.getAvailableModules(completedModuleIds);
    
    // Filter out modules already in progress
    const suggestions = available
      .filter(module => !inProgress.has(module.id))
      .slice(0, maxSuggestions);

    return suggestions;
  }

  /**
   * Private helper methods
   */
  private isOrderOptimal(currentOrder: ModuleNode[], optimalOrder: ModuleNode[]): boolean {
    const currentMap = new Map(currentOrder.map((m, i) => [m.id, i]));
    const optimalMap = new Map(optimalOrder.map((m, i) => [m.id, i]));

    for (const [moduleId, deps] of Array.from(this.dependencies.entries())) {
      for (const dep of deps) {
        if (dep.dependency_type === 'requires') {
          const modulePos = currentMap.get(moduleId);
          const depPos = currentMap.get(dep.depends_on_module_id);
          
          if (modulePos !== undefined && depPos !== undefined && depPos > modulePos) {
            return false;
          }
        }
      }
    }

    return true;
  }

  private findUnusedDependencies(): ModuleDependency[] {
    // This is a simplified implementation - in a real system you might check
    // actual usage patterns, completion rates, etc.
    const unused: ModuleDependency[] = [];
    
    for (const deps of Array.from(this.dependencies.values())) {
      for (const dep of deps) {
        if (dep.dependency_type === 'recommends') {
          // Check if the recommendation is actually being followed
          // This would require project-level data to implement fully
        }
      }
    }
    
    return unused;
  }
}

/**
 * Utility functions for common operations
 */

/**
 * Creates a new dependency manager instance
 */
export function createDependencyManager(
  modules: ModuleNode[], 
  dependencies: ModuleDependency[]
): ModuleDependencyManager {
  return new ModuleDependencyManager(modules, dependencies);
}

/**
 * Validates a single dependency addition
 */
export function validateDependencyAddition(
  modules: ModuleNode[],
  dependencies: ModuleDependency[],
  newDependency: Omit<ModuleDependency, 'id'>
): DependencyValidationResult {
  const testDependencies = [
    ...dependencies,
    { ...newDependency, id: 'temp-validation-id' }
  ];
  
  const manager = new ModuleDependencyManager(modules, testDependencies);
  return manager.validateDependencies();
}

/**
 * Gets module path showing dependency chain
 */
export function getModulePath(
  modules: ModuleNode[],
  dependencies: ModuleDependency[],
  moduleId: string
): string[] {
  const manager = new ModuleDependencyManager(modules, dependencies);
  const tree = manager.buildDependencyTree();
  
  function findPath(nodes: DependencyTreeNode[], targetId: string): string[] {
    for (const node of nodes) {
      if (node.module.id === targetId) {
        return node.path;
      }
      const childPath = findPath(node.dependents, targetId);
      if (childPath.length > 0) {
        return childPath;
      }
    }
    return [];
  }
  
  return findPath(tree, moduleId);
}

/**
 * Formats dependency tree for display
 */
export function formatDependencyTree(tree: DependencyTreeNode[], level: number = 0): string {
  let result = '';
  const indent = '  '.repeat(level);
  
  for (const node of tree) {
    const status = node.isAvailable ? '✅' : '❌';
    const prerequisites = node.prerequisitesMet ? '✓' : '✗';
    
    result += `${indent}${status} ${node.module.name} (${node.module.code}) [prereq: ${prerequisites}]\n`;
    
    if (node.dependents.length > 0) {
      result += formatDependencyTree(node.dependents, level + 1);
    }
  }
  
  return result;
}

