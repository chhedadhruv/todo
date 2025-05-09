import { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, Card, IconButton, useTheme, Snackbar, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useTodo } from '../contexts/TodoContext';
import { Todo } from '../types';

export default function TodoListScreen() {
  const { todos, loading, error, fetchTodos, updateTodo, deleteTodo } = useTodo();
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleToggleTodo = async (id: number) => {
    if (operationLoading) return;
    
    try {
      setOperationLoading(true);
      const todo = todos.find(t => t.id === id);
      if (todo) {
        await updateTodo(id, { completed: !todo.completed });
      }
    } catch (err) {
      console.error('Toggle todo error:', err);
      setSnackbarVisible(true);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (operationLoading) return;
    
    try {
      setOperationLoading(true);
      await deleteTodo(id);
    } catch (err) {
      console.error('Delete todo error:', err);
      setSnackbarVisible(true);
    } finally {
      setOperationLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTodos();
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <Card style={styles.todoCard}>
      <Card.Content>
        <View style={styles.todoHeader}>
          <View style={styles.todoTitleContainer}>
            <IconButton
              icon={item.completed ? 'check-circle' : 'circle-outline'}
              iconColor={item.completed ? theme.colors.primary : theme.colors.secondary}
              size={24}
              onPress={() => handleToggleTodo(item.id)}
              disabled={operationLoading}
            />
            <Text
              variant="titleMedium"
              style={[
                styles.todoTitle,
                item.completed && styles.completedTodo,
              ]}
            >
              {item.title}
            </Text>
          </View>
          {item.completed && (
            <Text style={[styles.completedBadge, { backgroundColor: theme.colors.primary }]}>
              Done
            </Text>
          )}
        </View>
        <Text style={styles.todoDescription}>{item.description}</Text>
        <View style={styles.todoFooter}>
          <Text style={styles.todoDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View style={styles.todoActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => router.push(`/edit/${item.id}`)}
              disabled={operationLoading}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteTodo(item.id)}
              disabled={operationLoading}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={styles.emptyText}>
              You don't have any todos yet.
            </Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first todo
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/create')}
        disabled={operationLoading}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: theme.colors.error }}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  todoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  todoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoTitle: {
    flex: 1,
    marginLeft: 8,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
    fontSize: 12,
  },
  todoDescription: {
    color: '#4B5563',
    marginBottom: 8,
  },
  todoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todoDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  todoActions: {
    flexDirection: 'row',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 